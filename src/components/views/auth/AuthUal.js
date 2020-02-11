import React from 'react';
import AuthApi from '../../../ual/AuthApi';

export default class AuthUal extends React.Component {
    componentDidMount() {
        const {refUAL} = this.props;
        refUAL(this);
        console.log('Se referencio el componente UAL');
    }

    async componentDidUpdate(prevProps) {
        try {
            const {updateUAL} = this.props;
            if (this.props.ual.activeUser !== prevProps.ual.activeUser && this.props.ual.activeUser !== null) {
                console.log('Ual respondio');
                updateUAL(this);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async SignContract(code) {
        let success = false;
        try {
            const mAuth = new AuthApi(this.props.ual.activeUser);
            console.log('mAuth', mAuth);
            await mAuth.signIn(code);
            success = true;
            return success;
        } catch (e) {
            throw new Error(e);
        }
    }

    renderUAL() {
        let success = false;
        try {
            console.log('UAL Start', this.props.ual);
            this.props.ual.showModal();
            success = true;
        } catch (e) {
            console.log('error rua', e);
        } finally {
           return success;
        }
    }

    resetUAL() {
        this.props.ual.restart();
    }

    logoutUAL() {
         const {updateUAL} = this.props;
         this.props.ual.logout();
         updateUAL(this);
    }

    render() {
        return (
            <React.Fragment>
                {(this.props.ual.activeUser) &&
                    <p>{this.props.ual.activeUser.accountName}</p>
                }
                <button type="button" onClick={() => this.renderUAL()}>Login with UAL</button>
                <button type="button" onClick={() => this.logoutUAL()}>logout</button>
                <button type="button" onClick={() => this.resetUAL()}>reset</button>
            </React.Fragment>
        );
    }
}
