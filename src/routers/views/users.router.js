import RouterClass from '../router.js';
import { renderLogin, renderRegister, renderResetPassword, renderResetPasswordFinalStep, getUsersProfileView } from '../../controllers/user.controller.js';

// Users Router
export default class UsersRouter extends RouterClass {
    init() {

        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* LOGIN *********/   
        this.get('/login', ["PUBLIC"], 'next', {}, renderLogin)

        /********* REGISTER *********/    
        this.get('/register', ["PUBLIC"], 'next', {}, renderRegister)

        /********* RESET PASSWORD *********/    
        this.get('/resetpassword', ["PUBLIC"], 'next', {}, renderResetPassword)    

        /********* RESET PASSWORD FINAL STEP *********/    
        this.get('/resetpassword/:token', ["PUBLIC"], 'next', {}, renderResetPasswordFinalStep)   

        /********* PROFILE *********/   
        this.get('/profile', ["USER", "ADMIN", "PREMIUM"], 'jwt', {}, getUsersProfileView)
    }
}

