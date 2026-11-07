const Usermodel = require('../model/auth.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    try {
        const { Name, Email, password } = req.body;

        // validation
        if (!Name || !Email || !password) {
            return res.status(400).json({
                message: 'Name, Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'Password must be at least 6 characters'
            });
        }

        const email = Email.toLowerCase().trim();

        // Check existing user
        const ExistUser = await Usermodel.findOne({ Email: email });

        if (ExistUser) {
            return res.status(400).json({
                message: 'User already exists please try diffrent email'
            });
        }

      
        const Hash = await bcrypt.hash(password, 10);

       
        const User = new Usermodel({
            Name,
            Email: email,
            password: Hash,
            role: 'user'
        });

        // Save user
        await User.save();

        
        const token = jwt.sign(
            {
                id: User._id,
                role: User.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: '7d'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none'
        });

        return res.status(201).json({
            message: 'User registered successfully',
            User: {
                id: User._id,
                Name: User.Name,
                Email: User.Email,
                role: User.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Server error'
        });
    }
};


const login = async (req, res) => {
    try {
        const { Email, password } = req.body;

        if (!Email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const email = Email.toLowerCase().trim();

        // Find user
        const ExistEmail = await Usermodel.findOne({
            Email: email
        });

        if (!ExistEmail) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        
        const ismatch = await bcrypt.compare(
            password,
            ExistEmail.password
        );

        if (!ismatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                id: ExistEmail._id,
                role: ExistEmail.role
            },
            process.env.JWT_KEY,
            {
                expiresIn: '1d'
            }
        );

        
const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
});

res.cookie("userId", ExistEmail._id.toString(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
});
  window.dispatchEvent(new Event("userUpdated"));
        return res.status(200).json({
            message: 'Successfully logged in',
            Data: {
                id: ExistEmail._id,
                Name: ExistEmail.Name,
                Email: ExistEmail.Email,
                role: ExistEmail.role
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Server error'
        });
    }
};

const logout = async (req,res)=>{

  res.clearCookie('token')
  res.clearCookie('userId')
    res.status(200).json({massage:'user logout successfully'})

}



module.exports = {
    register,
    login,
    logout
};
