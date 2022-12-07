
class ImageLazyLoad {
  el: HTMLImageElement;
  lazyLoad: any;
  callbackFn: Function = null;

  constructor(el: HTMLImageElement, callbackFn?: Function) {
    this.el = el;
    if (callbackFn && typeof callbackFn === 'function') {
      this.callbackFn = callbackFn;
    }

    window.IntersectionObserver ? this.intersectionApi() : (this.callbackFn ? this.callbackFn.bind(this).call() :  this.imageLoad(el));
  }

  imageLoad(target: HTMLImageElement) {
    const imageEl = target;
    imageEl.setAttribute('src', imageEl.getAttribute('data-lazy'));
    imageEl.onload = () => {
      imageEl.removeAttribute('data-lazy');
    }
  }

  intersectionApi() {
    const options = {
      root: null,
      threshold: 0.5,
      rootMargin: '0px',
    }

    const callback = (entries, observer) => {
      entries.forEach( entry => {
        if (entry.isIntersecting) {
            if (this.callbackFn) {
              this.callbackFn.bind(this, entry.target).call();
            } else {
              this.imageLoad(entry.target);
            }

            observer.unobserve(entry.target);
          }
      });
    }

    this.lazyLoad = new window.IntersectionObserver(callback, options);
    this.lazyLoad.observe(this.el);
  }
}

const useImageLazyLoad = () => {
  let imageLazyLoad;

  const init = (el: HTMLImageElement) => {
    imageLazyLoad = new ImageLazyLoad(el);
  }

  return {
    init,
  }
}


export default useImageLazyLoad;
