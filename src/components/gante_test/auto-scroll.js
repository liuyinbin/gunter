export default {
    data(){
        return{
            scrollFn: null
        }
    },
    methods:{
        autoScroll(e,scrollEl){
            if(!scrollEl) return;
            let scaleX = 0,sacleY = 0;
            if(e.clientX >= window.innerWidth - 40 || e.clientX >= scrollEl.getBoundingClientRect().right - 40){
                scaleX = 1
            }
            if(e.clientX <= scrollEl.getBoundingClientRect().left + 40){
                scaleX = -1
            }
            if(e.clientY >= window.innerHeight - 40 || e.clientY >= scrollEl.getBoundingClientRect().bottom - 40){
                sacleY = 1
            }
            if(e.clientY <= scrollEl.getBoundingClientRect().top + 40){
                sacleY = -1
            }
            if(this.scrollFn){
                clearInterval(this.scrollFn);
            }
            this.scrollFn = setInterval(()=>{
                scrollEl.scrollLeft += scaleX*20;
                scrollEl.scrollTop += sacleY*20;
            },30)
        }
    }
}
