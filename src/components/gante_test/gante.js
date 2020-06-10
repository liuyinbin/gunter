/**
 * Created by Administrator on 2018/12/27.
 */
import Gante from './gante.vue'
export default {
  install(Vue, options = {}) {
    const VueGante = Vue.extend(Gante)
    let gante = null

    function $gante(params) {
      return new Promise(resolve => {
        //   console.log(gante)
        let container = 'body'
        if (params.container) {
          container = params.container
        }
          gante = new VueGante()
          gante.$store = this.$root.$store;
          gante.$mount();
        let ganteLiuBox=document.querySelector('#gante .ganteLiuBox');
          // console.log('ganteLiuBox',ganteLiuBox);
        if(ganteLiuBox){
          document.querySelector(container).replaceChild(gante.$el,ganteLiuBox);
        }else{
          document.querySelector(container).appendChild(gante.$el);
        }
        // }
        gante.init(params);
        resolve(gante)
      })
    }

    Vue.prototype.$gante = $gante
  }
}
