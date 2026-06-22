const jwt = require('jsonwebtoken')

const generateToken = (userId) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in .env file')
        }
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' })
        console.log('Token generated successfully for user:', userId)
        return token
    } catch (error) {
        console.error('Error generating token:', error.message)
        throw error
    }
}

module.exports = generateToken