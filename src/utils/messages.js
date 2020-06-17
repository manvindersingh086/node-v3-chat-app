const generateMessage = (text,username) => {
    return {
        text,
        createdAt: new Date(),
        username : username
    }
}

const generateLocationMessage = (url,username) => {
    return {
        url,
        createdAt: new Date(),
        username:username
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}