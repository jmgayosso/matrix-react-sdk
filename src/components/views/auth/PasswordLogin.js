/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2019 New Vector Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import * as sdk from '../../../index';
import { _t } from '../../../languageHandler';
import SdkConfig from '../../../SdkConfig';
import {ValidatedServerConfig} from "../../../utils/AutoDiscoveryUtils";

import { UALProvider, withUAL } from 'ual-reactjs-renderer';
import { Scatter } from 'ual-scatter';

/**
 * A pure UI component which displays a username/password form.
 */
export default class PasswordLogin extends React.Component {
    static propTypes = {
        onSubmit: PropTypes.func.isRequired, // fn(username, password)
        onError: PropTypes.func,
        onEditServerDetailsClick: PropTypes.func,
        onForgotPasswordClick: PropTypes.func, // fn()
        initialUsername: PropTypes.string,
        initialPhoneCountry: PropTypes.string,
        initialPhoneNumber: PropTypes.string,
        initialPassword: PropTypes.string,
        onUsernameChanged: PropTypes.func,
        onPhoneCountryChanged: PropTypes.func,
        onPhoneNumberChanged: PropTypes.func,
        onPasswordChanged: PropTypes.func,
        loginIncorrect: PropTypes.bool,
        disableSubmit: PropTypes.bool,
        serverConfig: PropTypes.instanceOf(ValidatedServerConfig).isRequired,
        getCodeToSign: PropTypes.func,
    };

    static defaultProps = {
        onError: function() {},
        onEditServerDetailsClick: null,
        onUsernameChanged: function() {},
        onUsernameBlur: function() {},
        onPasswordChanged: function() {},
        onPhoneCountryChanged: function() {},
        onPhoneNumberChanged: function() {},
        onPhoneNumberBlur: function() {},
        initialUsername: "",
        initialPhoneCountry: "",
        initialPhoneNumber: "",
        initialPassword: "",
        loginIncorrect: false,
        disableSubmit: false,
        getCodeToSign: function() {},
    };

    static LOGIN_FIELD_EMAIL = "login_field_email";
    static LOGIN_FIELD_MXID = "login_field_mxid";
    static LOGIN_FIELD_PHONE = "login_field_phone";
    static LOGIN_FIELD_CUSTOM = "login_field_custom";

    constructor(props) {
        super(props);
        this.state = {
            username: this.props.initialUsername,
            password: this.props.initialPassword,
            phoneCountry: this.props.initialPhoneCountry,
            phoneNumber: this.props.initialPhoneNumber,
            loginType: PasswordLogin.LOGIN_FIELD_MXID,
            ualRef: null,
        };

        this.onForgotPasswordClick = this.onForgotPasswordClick.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.onUsernameChanged = this.onUsernameChanged.bind(this);
        this.onUsernameBlur = this.onUsernameBlur.bind(this);
        this.onLoginTypeChange = this.onLoginTypeChange.bind(this);
        this.onPhoneCountryChanged = this.onPhoneCountryChanged.bind(this);
        this.onPhoneNumberChanged = this.onPhoneNumberChanged.bind(this);
        this.onPhoneNumberBlur = this.onPhoneNumberBlur.bind(this);
        this.onPasswordChanged = this.onPasswordChanged.bind(this);
        this.isLoginEmpty = this.isLoginEmpty.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.state.loginType === PasswordLogin.LOGIN_FIELD_CUSTOM) {
            if (this.state.ualRef === null || prevState.ualRef === null) return;
            console.log('Listening changes NEW', this.state.ualRef.props.ual);
            console.log('Listening changes OLD', prevState.ualRef.props.ual);
            if (this.state.ualRef.props && this.state.ualRef.props.ual !== prevState.ualRef.props.ual && this.state.ualRef.props.ual.activeUser !== null) {
                // console.log(`Se logueo ${this.state.ualRef.ual.activeUser.accountName}`);
                console.log('Update PATERN');
                const code = await this.props.getCodeToSign();
                console.log('code p', code);
            }
        }
    }

    onForgotPasswordClick(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        this.props.onForgotPasswordClick();
    }

    async onSubmitForm(ev) {
        ev.preventDefault();

        let username = ""; // XXX: Synapse breaks if you send null here:
        let phoneCountry = null;
        let phoneNumber = null;
        let error;

        switch (this.state.loginType) {
            case PasswordLogin.LOGIN_FIELD_EMAIL:
                username = this.state.username;
                if (!username) {
                    error = _t("The email field must not be blank.");
                }
                break;
            case PasswordLogin.LOGIN_FIELD_MXID:
                username = this.state.username;
                if (!username) {
                    error = _t("The username field must not be blank.");
                }
                break;
            case PasswordLogin.LOGIN_FIELD_PHONE:
                phoneCountry = this.state.phoneCountry;
                phoneNumber = this.state.phoneNumber;
                if (!phoneNumber) {
                    error = _t("The phone number field must not be blank.");
                }
                break;
        }

        if (error) {
            this.props.onError(error);
            return;
        }

        if (!this.state.password) {
            this.props.onError(_t("The password field must not be blank."));
            return;
        }

        if (this.state.loginType === PasswordLogin.LOGIN_FIELD_CUSTOM) {
            console.log('Tratando de loguear con UAL', this.state.ualRef);
            await this.state.ualRef.renderUAL();
            return;
        }

        this.props.onSubmit(
            username,
            phoneCountry,
            phoneNumber,
            this.state.password,
        );
    }

    onUsernameChanged(ev) {
        this.setState({ username: ev.target.value });
        this.props.onUsernameChanged(ev.target.value);
    }

    onUsernameBlur(ev) {
        this.props.onUsernameBlur(ev.target.value);
    }

    onLoginTypeChange(ev) {
        const loginType = ev.target.value;
        this.props.onError(null); // send a null error to clear any error messages
        this.setState({
            loginType: loginType,
            username: "" // Reset because email and username use the same state
        });
    }

    onPhoneCountryChanged(country) {
        this.setState({
            phoneCountry: country.iso2,
            phonePrefix: country.prefix
        });
        this.props.onPhoneCountryChanged(country.iso2);
    }

    onPhoneNumberChanged(ev) {
        this.setState({ phoneNumber: ev.target.value });
        this.props.onPhoneNumberChanged(ev.target.value);
    }

    onPhoneNumberBlur(ev) {
        this.props.onPhoneNumberBlur(ev.target.value);
    }

    onPasswordChanged(ev) {
        this.setState({ password: ev.target.value });
        this.props.onPasswordChanged(ev.target.value);
    }

    renderLoginField(loginType) {
        const Field = sdk.getComponent("elements.Field");

        const classes = {};

        switch (loginType) {
            case PasswordLogin.LOGIN_FIELD_EMAIL:
                classes.error =
                    this.props.loginIncorrect && !this.state.username;
                return (
                    <Field
                        className={classNames(classes)}
                        id="mx_PasswordLogin_email"
                        name="username" // make it a little easier for browser's remember-password
                        key="email_input"
                        type="text"
                        label={_t("Email")}
                        placeholder="joe@example.com"
                        value={this.state.username}
                        onChange={this.onUsernameChanged}
                        onBlur={this.onUsernameBlur}
                        autoFocus
                    />
                );
            case PasswordLogin.LOGIN_FIELD_MXID:
                classes.error =
                    this.props.loginIncorrect && !this.state.username;
                return (
                    <Field
                        className={classNames(classes)}
                        id="mx_PasswordLogin_username"
                        name="username" // make it a little easier for browser's remember-password
                        key="username_input"
                        type="text"
                        label={_t("Username")}
                        value={this.state.username}
                        onChange={this.onUsernameChanged}
                        onBlur={this.onUsernameBlur}
                        autoFocus
                    />
                );
            case PasswordLogin.LOGIN_FIELD_PHONE: {
                const CountryDropdown = sdk.getComponent(
                    "views.auth.CountryDropdown"
                );
                classes.error =
                    this.props.loginIncorrect && !this.state.phoneNumber;

                const phoneCountry = (
                    <CountryDropdown
                        value={this.state.phoneCountry}
                        isSmall={true}
                        showPrefix={true}
                        onOptionChange={this.onPhoneCountryChanged}
                    />
                );

                return (
                    <Field
                        className={classNames(classes)}
                        id="mx_PasswordLogin_phoneNumber"
                        name="phoneNumber"
                        key="phone_input"
                        type="text"
                        label={_t("Phone")}
                        value={this.state.phoneNumber}
                        prefix={phoneCountry}
                        onChange={this.onPhoneNumberChanged}
                        onBlur={this.onPhoneNumberBlur}
                        autoFocus
                    />
                );
            }
            case PasswordLogin.LOGIN_FIELD_CUSTOM:
                // classes.error =
                //     this.props.loginIncorrect && !this.state.username;
                const mnetwork = {
                    chainId: '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f',
                    rpcEndpoints: [
                        {
                            protocol: 'https',
                            host: 'test.telos.kitchen',
                            port: 443,
                        },
                    ],
                };
                const appName = "Telos Net";
                const scatter = new Scatter([mnetwork], { appName });
                const UALApp = withUAL(LoginUal);
                return (
                    <UALProvider
                        chains={[mnetwork]}
                        authenticators={[
                            scatter,
                        ]}
                        appName={appName}
                    >
                        <UALApp
                            refUAL = { ref => this.setFirstUal(ref)}
                            updateUAL = { ref => this.updateRefUAL(ref)}
                        />
                    </UALProvider>
                );
        }
    }

    setFirstUal = (newUAL) => {
        if (this.state.ualRef !== null) return;
        this.setState({
            ...this.state,
            ualRef: newUAL,
        });
    }

    updateRefUAL = (newUAL) => {
        console.log('Se actualizara la referencia del ual');
        this.setState({
            ...this.state,
            ualRef: newUAL,
        });
    }

    isLoginEmpty() {
        switch (this.state.loginType) {
            case PasswordLogin.LOGIN_FIELD_CUSTOM:
                return ''
            case PasswordLogin.LOGIN_FIELD_EMAIL:
            case PasswordLogin.LOGIN_FIELD_MXID:
                return !this.state.username;
            case PasswordLogin.LOGIN_FIELD_PHONE:
                return !this.state.phoneCountry || !this.state.phoneNumber;
        }
    }

    render() {
        const Field = sdk.getComponent("elements.Field");
        const SignInToText = sdk.getComponent("views.auth.SignInToText");

        let forgotPasswordJsx;

        if (this.props.onForgotPasswordClick) {
            forgotPasswordJsx = (
                <span>
                    {_t(
                        "Not sure of your password? <a>Set a new one</a>",
                        {},
                        {
                            a: sub => (
                                <a
                                    className="mx_Login_forgot"
                                    onClick={this.onForgotPasswordClick}
                                    href="#"
                                >
                                    {sub}
                                </a>
                            )
                        }
                    )}
                </span>
            );
        }

        const pwFieldClass = classNames({
            error: this.props.loginIncorrect && !this.isLoginEmpty() // only error password if error isn't top field
        });

        const loginField = this.renderLoginField(this.state.loginType);

        let loginType;
        if (!SdkConfig.get().disable_3pid_login) {
            loginType = (
                <div className="mx_Login_type_container">
                    <label className="mx_Login_type_label">
                        {_t("Sign in with")}
                    </label>
                    <Field
                        id="mx_PasswordLogin_type"
                        element="select"
                        value={this.state.loginType}
                        onChange={this.onLoginTypeChange}
                    >
                        <option
                            key={PasswordLogin.LOGIN_FIELD_MXID}
                            value={PasswordLogin.LOGIN_FIELD_MXID}
                        >
                            {_t("Username")}
                        </option>
                        <option
                            key={PasswordLogin.LOGIN_FIELD_EMAIL}
                            value={PasswordLogin.LOGIN_FIELD_EMAIL}
                        >
                            {_t("Email address")}
                        </option>
                        <option
                            key={PasswordLogin.LOGIN_FIELD_PHONE}
                            value={PasswordLogin.LOGIN_FIELD_PHONE}
                        >
                            {_t("Phone")}
                        </option>
                        <option
                            key={PasswordLogin.LOGIN_FIELD_CUSTOM}
                            value={PasswordLogin.LOGIN_FIELD_CUSTOM}
                        >
                            {_t("My_option")}
                        </option>
                    </Field>
                </div>
            );
        }

        return (
            <div>
                <SignInToText
                    serverConfig={this.props.serverConfig}
                    onEditServerDetailsClick={
                        this.props.onEditServerDetailsClick
                    }
                />
                <form onSubmit={this.onSubmitForm}>
                    {loginType}
                    {loginField}
                    {this.state.loginType !== PasswordLogin.LOGIN_FIELD_CUSTOM &&
                        <Field
                        className={pwFieldClass}
                        id="mx_PasswordLogin_password"
                        type="password"
                        name="password"
                        label={_t("Password")}
                        value={this.state.password}
                        onChange={this.onPasswordChanged}
                    />}
                    {forgotPasswordJsx}
                    <input
                        className="mx_Login_submit"
                        type="submit"
                        value={_t("Sign in")}
                        disabled={this.props.disableSubmit}
                    />
                </form>
            </div>
        );
    }
}

import AuthApi from '../../../ual/AuthApi';

class LoginUal extends React.Component {
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

    async SignContract() {
        let success = false;
        try {
            const mAuth = new AuthApi(this.props.ual.activeUser);
            console.log('mAuth', mAuth);
            await mAuth.signIn();
            success = true;
        } catch (e) {
            console.log(e);
        } finally {
            return success;
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
