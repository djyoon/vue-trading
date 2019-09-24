<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info">
            <b-navbar-brand>BitMax</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
                <div v-if="isLogin">
                    <b-navbar-nav>
                        <b-nav-item @click="goPage('/trade')" :class="{active : activeUrl == '/trade' }">BTC</b-nav-item>
                    </b-navbar-nav>
                </div>
                    <b-navbar-nav  class="ml-auto">
                        <div v-if="isLogin">
                            <b-nav-item-dropdown right>
                                <!-- Using 'button-content' slot -->
                                <template v-slot:button-content>
                                    <em>{{ loginId }}</em>
                                </template>
                                <b-dropdown-item @click='reqYield' v-b-modal.modal-asset>수익률 확인</b-dropdown-item>
                                <b-dropdown-item @click="logout">로그아웃</b-dropdown-item>
                            </b-nav-item-dropdown>
                        </div>
                    </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <b-navbar type="dark" variant="dark">
            <b-collapse id="nav-collapse" is-nav>
                <div v-if="isLogin">
               <!--     <b-navbar-nav>
                        <b-nav-item @click="goPage('/trade/rank')" :class="{active : activeUrl == '/trade/rank'}" >모의투자 순위</b-nav-item>
                    </b-navbar-nav>-->
                </div>>
            </b-collapse>
        </b-navbar>

        <b-modal ref='signup-modal' id="modal-asset" centered title="수익률 확인">
            <div>
                <b-table striped :items="items"></b-table>
            </div>
            <div slot="modal-footer"></div>
        </b-modal>
    </div>
</template>

<script src="./navigation.js"></script>
