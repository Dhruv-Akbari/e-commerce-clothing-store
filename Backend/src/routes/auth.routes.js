const express=require('express');
const Authrouter=require('../controller/auth.controller')
const router=express()

router.post('/Register',Authrouter.register)
router.post('/Login',Authrouter.login)
router.post('/Logout',Authrouter.logout)

module.exports=router