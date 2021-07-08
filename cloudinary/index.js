const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
cloudinary.config({
    cloud_name: 'dyowctdhx', 
    api_key: '891889593884817',
    api_secret: '1lNywnPjp51CRKlSbpo3rCPDSmQ'
});

const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'Rental',
        allowedFormats:['jpeg', 'jpg', 'png']
    }
});
module.exports = {
    cloudinary,
    storage
}