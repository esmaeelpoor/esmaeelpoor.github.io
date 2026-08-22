// Scrollspy (kept for compatibility with the current navigation)
var spy = new Gumshoe('#nav a', {
    offset: 80,
    reflow: true,
    activeClass: 'active'
});

// Burger
$('.burger').on('click', function () {
    $(this).toggleClass('open');
    $('.navigation-bar').toggleClass('show');
});

// Dark mode
$('.darkmode-btn').on('click', function () {
    $('body').toggleClass('darkmode');
});

// Sticky navbar
$(document).ready(function(){
    $(window).on('scroll.stickyNav', function() {
        var navHeight = $('header').height();
        if ($(window).scrollTop() > navHeight) {
            $('header').addClass('fixed');
        } else {
            $('header').removeClass('fixed');
        }
    });
});

// Scroll to top
var btn = $('.scrollup');
$(window).on('scroll.scrollUp', function() {
    if ($(window).scrollTop() > 500) {
        btn.addClass('show');
    } else {
        btn.removeClass('show');
    }
});
btn.on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({scrollTop:0}, 500);
});

function fixCarouselAccessibility(){
    $('.testmonial-slider .owl-dot').each(function(index){
        $(this).attr('aria-label', 'نمایش افتخار ' + (index + 1));
        $(this).removeAttr('role'); // native button semantics are enough
    });
    $('.testmonial-slider .owl-prev')
        .removeAttr('role')
        .attr('aria-label','اسلاید قبلی');
    $('.testmonial-slider .owl-next')
        .removeAttr('role')
        .attr('aria-label','اسلاید بعدی');
}

// Achievements carousel
var $testimonialSlider = $('.testmonial-slider');
$testimonialSlider.on('initialized.owl.carousel refreshed.owl.carousel', function(){
    setTimeout(fixCarouselAccessibility, 0);
});
$testimonialSlider.owlCarousel({
    autoplay:true,
    autoplayTimeout:4500,
    autoplayHoverPause:true,
    loop:true,
    responsiveClass:true,
    nav:false,
    dots:true,
    smartSpeed:700,
    margin:30,
    responsive:{
        0:{items:1},
        600:{items:2},
        1000:{items:2}
    }
});
fixCarouselAccessibility();

// Give repeated visible “مشاهده” links a unique accessible name.
$('.btn-view').each(function(){
    if (!this.getAttribute('aria-label')) {
        var title = $(this).closest('.project-item').find('h3').first().text().replace(/\s+/g,' ').trim();
        if (title) this.setAttribute('aria-label', 'مشاهده ' + title);
    }
});
