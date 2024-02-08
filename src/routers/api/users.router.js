import RouterClass from '../router.js';
import { login, githubCallback, logout, registerCallback, resetPassword, resetPasswordFinalStep, changeUserRole, deleteUser, getUser, current, postUserDocument, getUsers, deleteInactiveUsers } from '../../controllers/user.controller.js';
import { uploaderDocument } from '../../middlewares/multer-uploader.js';

// Users Router
export default class UsersRouter extends RouterClass {
    init() {

        /************************************/   
        /*************** API ****************/   
        /************************************/ 
        
        /********* REGISTER *********/    
        this.post('/register', ["PUBLIC"], 'register', {}, registerCallback)

        /********* LOGIN *********/    
        this.post('/login', ["PUBLIC"], 'login', {}, login)

        /********* GITHUB LOGIN *********/ 
        this.get('/github', ["PUBLIC"], 'github', { scope: ['user:email']})
        this.get('/githubcallback', ["PUBLIC"], 'github', { failureRedirect: '/user/login' }, githubCallback)

        /********* LOGOUT *********/    
        this.get('/logout', ["USER", "ADMIN", "PREMIUM"], 'next', {}, logout)

        /********* RESET PASSWORD *********/    
        this.post('/resetpassword', ["PUBLIC"], 'next', {}, resetPassword)

        /********* RESET PASSWORD FINAL STEP *********/    
        this.post('/resetpasswordfinalstep', ["PUBLIC"], 'next', {}, resetPasswordFinalStep)

        /********* CHANGE ROL USER-PREMIUM *********/    
        this.put('/premium/:uid', ["USER", "PREMIUM", "ADMIN"], 'next', {}, changeUserRole)

        /********* DELETE USER *********/    
        this.delete('/:uid', ["USER", "ADMIN", "PREMIUM"], 'next', {}, deleteUser)

        /********* GET USER *********/    
        this.get('/current', ["USER", "ADMIN", "PREMIUM"], 'next', {}, current)
        
        /********* GET USER *********/    
        this.get('/:uid', ["USER", "ADMIN", "PREMIUM"], 'next', {}, getUser)
        
        /********* POST USER DOCUMENT *********/    
        this.post('/:uid/documents', ["USER", "ADMIN", "PREMIUM"], 'next', {}, uploaderDocument, postUserDocument)
        
        /********* GET ALL USERS *********/    
        this.get('/', ["PUBLIC"], 'next', {}, getUsers)
        
        /********* DELETE ALL INACTIVE USERS *********/    
        this.delete('/', ["PUBLIC"], 'next', {}, deleteInactiveUsers)

    }
}

