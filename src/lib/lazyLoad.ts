// See how the options work here: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
const options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.25
}

export const lazyLoad = (image: HTMLImageElement, src: string) => {
    const loaded = () => {
		image.style.opacity = "1"
    }
    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            image.src = src
            if (image.complete) {
                loaded()        
            } else {
                image.addEventListener('load', loaded)
            }
        }
    }, options)
    observer.observe(image)

    return {
        destroy() {
            image.removeEventListener('load', loaded)
        }
    }
}