import PPP from '..';
// import { Auth } from 'aws-amplify';
import BaseEosApi from './BaseEosApi';

/**
 * @desc Enables the authentication of the user with the aws backend services
 * @see BaseEosApi
 */
class AuthApi extends BaseEosApi {

    constructor(activeUser) {
        super(activeUser, 'logintester1');
        this.setActiveUser(activeUser);
    }

    init() {
        // PPP.events.on('activeUserChanged', (activeUser) => this.setActiveUser(activeUser));
    }

    async _signUp(accountName) {
        // return Auth.signUp({
        //     username: accountName,
        //     password: Util.getRandomString(30),
        // });
        return;
    }

    /**
     * Signs In logged in user with the backend
     * 
     * @returns {Objec} current session, this object does not have to be analyzed 
     * you can assume the call was successful if no exception is thrown
     */
    async signIn() {
        // const accountName = await this.getAccountName();
        // const accountName = 'jmgayosso151';
        // try {
        //     await this._signUp(accountName);
        // } catch (error) {
        //     if (error.name !== 'UsernameExistsException') {
        //         throw error;
        //     }
        // }
        // eslint-disable-next-line no-unused-vars
        // let cognitoUser = await Auth.signIn(accountName);
        // const { challengeParam: { loginCode } } = cognitoUser;
        await this._authenticate('loginCode');
        // cognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, loginCode);
        return this.currentSession();
    }

    async _authenticate(code) {
        return this.transact({
            name: 'loginuser',
            data: {
                account_name: await this.getAccountName(),
                login_code: code,
            },
        });
    }

    /**
     * Returns current session if one exists
     * 
     * @returns {Objec} current session
     * @throws exception if user is not logged in
     */
    async currentSession() {
        // return Auth.currentSession();
    }

    /**
     * Returns current user info if one exists
     * 
     * @returns {Objec} current user info
     * @throws exception if user is not logged in
     */
    async userInfo() {
       // return Auth.currentUserInfo();
    }

    /**
     * Indicates whether a current valid session exists
     * 
     * @returns {boolean} indicating if valid session exists
     */
    async hasValidSession() {
        try {
            const session = await this.currentSession();
            return session.isValid();
        } catch (error) {
            return false;
        }
    }

    /**
     * Signs the user out
     */
    async signOut() {
        // try {
        //     await Auth.signOut();
        // } catch (error) {
        //     console.warn('Error signing out', error);
        // }
        // this.emit('signOut');
    }
}

export default AuthApi;
