<template>
    <div :style="{color:color}" class="loadBox">
        <div v-show="showLoading" class="gj-loading"></div>
        <div style="color: #ccc" v-show="!showLoading">
            <slot></slot>
        </div>

    </div>
</template>

<script>
    export default {
        name: "loading",
        props:{
            color:{
                default:'#3396fb',
                type:String
            },
            showLoading:{
                default:true,
                type:Boolean
            }
        }
    }
</script>

<style scoped>
    .loadBox{
        height: 50px;
        line-height: 50px;
        text-align: center;
    }
    .gj-loading {
        display: inline-block;
        width: 15px;
        height: 15px;
        color: inherit;
        vertical-align: middle;
        pointer-events: none;
        border: 2px solid currentcolor;
        border-bottom-color: transparent;
        border-radius: 50%;
        -webkit-animation: 1s gj-loading linear infinite;
        animation: 1s gj-loading linear infinite;
        position: relative;
    }
    @-webkit-keyframes gj-loading {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
    @keyframes gj-loading {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
</style>
