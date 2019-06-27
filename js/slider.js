
class Slider {
    constructor(slidesClass, controlPrev, controlNext, progress, time, pause) {
        this.time = time;
        this.anim = null;
        this.slides = document.getElementsByClassName(slidesClass);
        this.arrowLeft = document.getElementById(controlPrev);
        this.arrowRight = document.getElementById(controlNext);
        this.loadBar = document.getElementById(progress);
        this.pauseSlide = document.getElementById(pause);
        this.current = 0;
        this.reset();
        this.init();
        this.arrowLeftMove();
        this.arrowRightMove();
        this.progressBar();
        this.pause_slideshow();
        this.key();

    }
    
    init() {
        this.slides[this.current].style.display = "block";

    }
    reset() {

        for (let i = 0; i < this.slides.length; i++) {
            this.slides[i].style.display = "none";
        }

    }

    moveLeft() {
        this.current--;
        this.reset();
        if (this.current < 0) {
            this.current = this.slides.length - 1;

        }

        this.slides[this.current].style.display = "block";

        this.progressBar();

    }
    moveRight() {
        this.current++;
        this.reset();
        if (this.current >= this.slides.length) {
            this.current = 0;

        }
        this.slides[this.current].style.display = "block";
        this.progressBar();


    }


    arrowLeftMove() {
            
        var slider = this;
        this.arrowLeft.addEventListener("click", function () {

            slider.moveLeft();


        })

    }

    arrowRightMove() {
        var slider = this;

        this.arrowRight.addEventListener("click", function () {


            slider.moveRight();


        })

    }

    progressBar() {

        clearInterval(this.anim);
        var slider = this;
        var width = 0;
        this.anim = setInterval(frame, this.time / 100);

        function frame() {
            if (width >= 100) {
                clearInterval(slider.anim);
                slider.moveRight();
                slider.progressBar();


            } else {
                width++;
                slider.loadBar.style.width = width + '%';

            }
        }

    }
    pause_slideshow() {

        var slider = this;
       this.pauseSlide.addEventListener("click", function () {
               
            clearInterval(slider.anim);
        
        });
        
    }
    /*****************************************
       Ã‰COUTE DES FLÃˆCHES DIRECTIONNELLES
    *****************************************/
    key() {
        $(document).keydown(function (e) {
            switch (e.which) {
                case 37: // gauche

                    slider.moveLeft();
                    break;
                case 39: // droite

                    slider.moveRight();
                    break;

                default:
                    return; // quitter si une autre toucher est appuyÃ©e
            }
        });

        //  
    }
}
var slider = new Slider("slides", "leftArrow", "rightArrow", "progressBar", 5000, "pausebouton");


