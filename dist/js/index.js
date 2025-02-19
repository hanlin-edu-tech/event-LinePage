// 取得 URL 查詢參數 abtest 的值，若無則為 null
const abtest = new URLSearchParams(window.location.search).get('abtest'); 
// 根據 abtest 參數是否存在，切換圖片
document.getElementById('image').src = (abtest === 'y') ? './img/abtest-QRcode.png' : './img/qrcode.png';