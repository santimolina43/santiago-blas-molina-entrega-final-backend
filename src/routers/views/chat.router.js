import RouterClass from '../router.js';
import { getChatView, postMessage } from '../../controllers/chat.controller.js';

export default class ChatRouter extends RouterClass {
    init() {

        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* CHAT *********/   
        this.get('/', ["USER", "ADMIN", "PREMIUM"], 'next', {}, getChatView)

    }
}