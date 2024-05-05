function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isIPAddress(input) {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;
    return ipRegex.test(input);
}

module.exports = {
    sleep,
    isIPAddress
};
