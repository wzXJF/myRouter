let Vue = null;

class HistoryRoute {
    constructor(){
        this.current = null
    }
}

class VueRouter {
    constructor(options){
        this.mode = options.mode || 'hash';
        this.routes = options.routes || []
        // 格式化成{'path':component}的map格式,方便使用
        this.routesMap = this.createMap(this.routes);
        // 保存当前的route对象
        this.history = new HistoryRoute();

        // 做一些事件的监听来更新currentRoute
        this.init();
    }

    init(){
        if (this.mode === 'hash') {
            location.hash ? '' : location.hash = '/';
            window.addEventListener('load', () => {
                console.log(location.hash);
                this.history.current = location.hash.slice(1)
                console.log(location.hash);
            });
            window.addEventListener('hashchange', () => {
                this.history.current = location.hash.slice(1)
            })
        }else{
            location.pathname ? '': location.pathname = '/'
            window.addEventListener('load', () => {
                this.history.current = location.pathname
            })
            window.addEventListener('popstate', () => {
                this.history.current = location.pathname;
            })
        }
    }

    createMap(routes){
        return routes.reduce((pre, current) => {
            pre[current.path] = current.component;
            return pre
        }, {})
    }
}

VueRouter.install = function(v){
    Vue = v;
    // 让其它的属性也拥有$router对象
    Vue.mixin({
        beforeCreate() {
            if (this.$options && this.$options.router) {//如何是根实例的话
                this._root = this;// 把当前实例挂载在root上
                this._router = this.$options.router;
                console.log(Vue);
                console.log(Vue.util);
                Vue.util.defineReactive(this,"xxx",this._router.history)
            }else{//如果是子组件
                // 这个主要的作用就是去哪根组件上的_root,然后才能拿到router实例,而且这个是一步步从根到各个子组件
                this._root = this.$parent && this.$parent._root;
                /*
                    为什么当前实例的父实例存在,就能从父实例上拿取到_root呢? 其实结果就是父子组件的挂载顺序
                    父beforeCreate-> 父created -> 父beforeMounte -> 子beforeCreate ->子create ->子beforeMount ->子 mounted -> 父mounted
                */ 
            }

            // 挂载$router到组件实例上
            Object.defineProperty(this, '$router', {
                get(){
                    return this._root._router;
                }
            })
            Object.defineProperty(this, '$route', {
                get(){
                    return this._root._router.history.current;
                }
            })
        },
    })

    // 创建两个组件,router-view  router-link, 挂载到Vue的实例上
    Vue.component('router-link', {
        props: {
            to: String
        },
        render(h) {
            let mode = this._self._root._router.mode;
            let to = mode === 'hash'?(`#${this.to}`):this.to;
            let current = this._self._root._router.history.current;

            const self = this;
            return h('a', {attrs:{href: to, class: ( (current === to || `#${current}` === to) ? 'router-link-exact-active router-link-active' : '')},
                on: {
                    click(e){
                        if(mode === 'history'){
                            e.preventDefault();
                            self._self._root._router.history.current = to;
                            history.pushState(null, '', to) 
                        }
                    }
                },
            },
            this.$slots.default)
        },
    })

    Vue.component('router-view', {
        render(h) {
            console.log('router-view 被重新渲染了');
            let current = this._self._root._router.history.current;
            let routesMap = this._self._root._router.routesMap;
            return h(routesMap[current])
        },
    })
}

export default VueRouter
