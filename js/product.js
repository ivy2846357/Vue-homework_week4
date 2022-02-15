/* 使用 ESM 載入 Vue */
import {
    createApp
} from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';

/* 使用 ESM 載入元件資料 */
import pagination from './components/pagination.js';
import bsProductModal from './components/productModal.js';
import bsDelProductModal from './components/delProductModal.js';

let productModal = '';
let delProductModal = '';

/* 建立 Vue 的初始及實體化環境 */
const app = createApp({
    data() {
        return {
            // 站點網址
            url: 'https://vue3-course-api.hexschool.io/',
            // 自己申請的 API 路徑
            api_path: 'ivy2846357',
            // 商品資料存放處
            products: [],
            tempProduct: {
                imagesUrl: []
            },
            isNew: true,
            pagination: {}
        }
    },
    methods: {
        // 驗證使用者
        checkUser() {
            axios.post(`${this.url}v2/api/user/check`)
                // 驗證成功可以停留在後台，並取得商品資料 
                .then(res => {
                    console.log('使用者身分驗證成功');
                    this.getProductData();
                })
                // 驗證失敗則回到登入頁面   
                .catch(err => {
                    alert(err.data.message);
                    window.location = 'index.html'
                })
        },
        // 取得產品資料
        getProductData(page = 1) {
            axios.get(`${this.url}v2/api/${this.api_path}/admin/products/?page=${page}`)
                .then(res => {
                    this.products = res.data.products;
                    this.pagination = res.data.pagination;
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 依據按鈕屬性，點擊後打開不同的 bootstrapModal
        openModal(state, productInfo) {
            if (state === 'new') {
                // 新增產品的視窗

                // 將資料及圖片的內容清空
                this.tempProduct = {
                    imagesUrl: []
                };
                // 這裡 isNew 的狀態會影響到之後 API 是要接新增還是編輯
                this.isNew = true;
                // 打開 product modal
                productModal.show();
            } else if (state === 'edit') {
                // 編輯產品的視窗

                // 這裡使用淺層拷貝將商品資料放入物件中
                this.tempProduct = {
                    ...productInfo
                };
                this.isNew = false;
                // 打開 product modal
                productModal.show();
            } else if (state === 'delete') {
                // 刪除產品的視窗

                // 這裡使用淺層拷貝是為了抓到該產品的名稱
                this.tempProduct = {
                    ...productInfo
                };
                // 打開 delproduct modal
                delProductModal.show();
            }
        },
        // 新增、編輯商品
        // 因為 post 和 put 的程式相似，所以可以寫在一起
        updateProduct() {
            let api_url = '';
            let api_method = '';

            // 依據 isNew 的狀態進行判斷
            // isNew 為 true 就使用 post 新增商品，isNew 為 false 就使用 put 編輯商品
            if (this.isNew) {
                api_url = `${this.url}v2/api/${this.api_path}/admin/product/`;
                api_method = 'post';
            } else {
                api_url = `${this.url}v2/api/${this.api_path}/admin/product/${this.tempProduct.id}`;
                api_method = 'put';
            }

            // 帶入 api 路徑和 api method
            axios[api_method](api_url, {
                    data: this.tempProduct
                })
                .then(res => {
                    if (api_method === 'put') {
                        // 如果程式是跑 put method，就顯示以下內容


                        alert('商品資料編輯成功');
                        // 成功後關閉 bootstrap modal
                        productModal.hide();
                        // 重新渲染商品資料
                        this.getProductData();
                    } else {
                        // 如果程式是另一個 method，就顯示以下內容

                        alert('新增商品資料成功');
                        // 成功後關閉 bootstrap modal
                        productModal.hide();
                        // 重新渲染商品資料
                        this.getProductData();
                    }
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        //刪除商品
        delProduct() {
            axios.delete(`${this.url}v2/api/${this.api_path}/admin/product/${this.tempProduct.id}`)
                .then(res => {
                    alert('商品資料已刪除');
                    // 成功後關閉 bootstrap modal
                    delProductModal.hide();
                    // 重新渲染商品資料
                    this.getProductData();
                })
                .catch(err => {
                    alert(err.data.message);
                })
        }
    },
    // 元件設定
    components: {
        pagination,
        bsProductModal,
        bsDelProductModal
    },
    mounted() {
        /* 使用者驗證設定 */

        // 取出 Token 的值
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)myToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
        // 預設 headers 內夾帶 token 的值
        axios.defaults.headers.common.Authorization = token;
        // 使用者驗證
        this.checkUser();

        /* bootstrapModal 相關設定 */

        // 商品相關視窗
        productModal = new bootstrap.Modal(document.getElementById('productModal'), {
            keyboard: false
        });
        delProductModal = new bootstrap.Modal(document.getElementById('delProductModal'), {
            keyboard: false
        });

    }
})

app.mount('#app');