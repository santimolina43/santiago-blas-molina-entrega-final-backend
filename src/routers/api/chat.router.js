import RouterClass from '../router.js';
import { postMessage } from '../../controllers/chat.controller.js';

export default class ChatRouter extends RouterClass {
    init() {

        /************************************/   
        /*************** API ****************/   
        /************************************/ 
        
        /********* POST MESSAGES *********/   
        this.post('/messages', ["USER", "PREMIUM"], 'next', {}, postMessage)
    }
}