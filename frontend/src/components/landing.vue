<template>
    <div class="container">
        <h2><b-badge>암호화폐 모의 거래소 비트맥스</b-badge></h2>
        <div class="login-form">
            <b-row class="my-1">
                <b-col sm="9">
                    <b-form-input v-model="loginId" placeholder="Enter ID" ></b-form-input>
                </b-col>
            </b-row>
            <b-row class="my-1">
                <b-col sm="9">
                    <b-form-input v-model="loginPw" type="password" placeholder="Enter password"></b-form-input>
                </b-col>
            </b-row>
            <b-row class="my-1">
                <b-col sm="6">
                    <b-button variant="primary" @click="reqLogin" :disabled="loginCheck">로그인!</b-button>

                    <span>
                        <b-button v-b-modal.modal-center>회원가입</b-button>
                        <b-modal ref='signup-modal' id="modal-center" centered title="비트맥스 회원가입">
                            <b-row class="my-1">
                                <b-col sm="12">
                                    <b-form-input v-model="signId" placeholder="Enter ID" :maxlength="8"></b-form-input>
                                </b-col>
                            </b-row>
                            <b-row class="my-1">
                                <b-col sm="12">
                                    <b-form-input v-model="signPw" type="password" placeholder="Enter password" :maxlength="16"></b-form-input>
                                </b-col>
                            </b-row>
                            <b-row class="my-1">
                                <b-col sm="12">
                                    <b-form-input v-model="signPw2" type="password" placeholder="Confirm password" :maxlength="16"></b-form-input>
                                </b-col>
                            </b-row>
                            <b-button style="float:right;" @click="reqSignup" :disabled="signCheck">회원가입</b-button>
                            <div slot="modal-footer"></div>
                        </b-modal>
                    </span>
                </b-col>
            </b-row>
        </div>
    </div>



</template>

<script src="./landing.js"></script>
<style>
    .container img {
        float : left;
    }
    .container input{
        width: 50%;
    }
    .login-form {
       margin-top : 100px;
    }
    .login-form .btn-primary {
        margin-right : 10px;
    }



</style>
