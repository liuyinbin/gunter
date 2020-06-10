<!--表格tr-->
<template>
    <div class="gante-tr-box">
        <!--为了设置母子显示线 gante-cell_after  gante-cell_after_first gante-cell_after_last-->
        <div class="gante-tr-one"
             :key="index"
             v-for="(tr,index) in data">
            <!--普通表格-->
            <div class="gante-tr" :class="{gj_hover_class: tr.is_hover}" @mouseenter="enterTr($event,tr)"
                 @mouseleave="leaveTr($event,tr)" >
                <div class="gante-td" v-show="th.show != false" v-for="(th,key) in th_data"
                     :style="{textAlign:th.value == '编号'?'center':'null'}">
                    <td-cell :td_data="tr" :index="index" :key_value="key"
                             :th="th"></td-cell>
                </div>
            </div>
            <gante-tr v-if="tr.children && tr.open" :parent_data="tr"
                      :all_data="all_data"
                      :data="tr.children" :th_data="th_data"></gante-tr>
        </div>
    </div>
</template>
<script>
    import tdCell from './gante-table-td.vue'
    import {mapState, mapMutations} from 'vuex';

    export default {
        name: 'gante-tr',
        props: {
            all_data: Array,
            data: Array,
            th_data: Object,
            // 父级数据
            parent_data: {
                type: Object,
                default: null
            }
        },
        components: {
            tdCell
        },
        methods: {
            opens(data) {
                this.$set(data, 'open', !data.open)
            },
            // 进入到了tr上
            enterTr(ev, tr) {
                this.$set(tr, 'is_hover', true)
            },
            // 离开了tr
            leaveTr(ev, tr) {
                this.$set(tr, 'is_hover', false)
            },
        }
    }
</script>
<style lang="less">
    .gante-tr-box {
        width: max-content;

        .add_task, .seeMore {
            color: #3396fb;
            cursor: pointer;
            display: flex;
            align-items: center;
            height: 40px;
            line-height: 40px;
            border-bottom: 1px solid #ebeef5;

            &:hover {
                opacity: 0.8;
            }
        }
    }

    .gante-tr-one {
        .gante-tr.gj_hover_class {
            background: rgba(246, 246, 246, 0.7);
        }

        .gante-group-text {
            box-sizing: border-box;
            text-overflow: ellipsis;
            vertical-align: middle;
            white-space: nowrap;
            border-bottom: 1px solid #ebeef5;
            border-right: 1px solid #ebeef5;
            line-height: 40px;
            padding: 0 10px;
            color: #333;
            width: 100%;
            font-weight: bold;
            .trigger{
                position: absolute;
                left: 5px;
                width: 10px;
                cursor: pointer;
                .open-icon {
                    font-size: 12px;
                    color: #bfbfbf;
                    cursor: pointer;
                }
                &:hover .open-icon{
                    color: #999;
                }
            }

        }

        &.gante-cell_after {
            position: relative;

            &:after {
                position: absolute;
                content: '';
                top: 25px;
                left: calc(8px + var(--leftAfter));
                border-left: 1px dashed #0fb7a6;
                height: calc(100% - 45px);
            }

            .gante-tr {
                position: relative;

                &:after {
                    position: absolute;
                    content: '';
                    top: 20px;
                    left: calc(var(--leftAfter) - 10px);
                    border-top: 1px dashed #0fb7a6;
                    width: 15px;
                    height: 1px;
                }

                &.gante_tr_only:after {
                    left: 40px;
                    width: calc(var(--leftAfter) - 36px);
                }
            }
        }

        &.gante-cell_after_last {
            position: relative;

            &:before {
                position: absolute;
                content: '';
                top: 20px;
                left: calc(-10px + var(--leftAfter));
                border-left: 1px solid #fff;
                height: calc(100% - 40px);
                z-index: 1;
            }
        }

        &.gante-cell_after_first > .gante-tr:after {
            display: none;
        }
    }
</style>
