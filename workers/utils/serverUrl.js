const devUrl = 'http://school.local';
const productionUrl = 'https://school.siddhantait.com';
const devApiUrl = 'http://schoolapi.local';
const productionApiUrl = 'https://schoolapi.siddhantait.com';

const isProduction = process.env.NODE_ENV === 'production';
const resolvedUrl = isProduction ? productionUrl : devUrl;
const resolvedApiUrl = isProduction ? productionApiUrl : devApiUrl;

module.exports = {
    devUrl: resolvedUrl, 
    productionUrl: resolvedUrl, 
    devApiUrl: resolvedApiUrl,
    productionApiUrl: resolvedApiUrl
};