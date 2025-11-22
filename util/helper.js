exports.decryptToken = (token) => {
    return Buffer.from(token, 'base64')
        .toString('utf-8')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, ',')
        .substring(8);
}