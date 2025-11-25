document.addEventListener('DOMContentLoaded', function() {

    // --- ELEMENTLER ---
    const wrapper = document.querySelector('.scroll-wrapper');
    const track = document.querySelector('.scroll-track');
    const thumb = document.querySelector('.scroll-thumb');
    const indicator = document.querySelector('.scroll-indicator'); 

    if (!wrapper || !track || !thumb || !indicator) {
        console.error("Gerekli kaydırma elementleri bulunamadı!");
        return;
    }

    // --- DEĞİŞKENLER ---
    let isDown = false;
    let startX;
    let scrollLeftStart;
    let targetScroll = 0;
    let currentScroll = 0;
    let easing = 0.08; 
    let maxScrollLeft = 0;
    let isScrollable = false; 
    let isAnimating = false;
    
    // Tıklama ile Sürüklemeyi ayırt etmek için başlangıç noktası
    let clickStartX = 0;

    // --- YARDIMCI FONKSİYONLAR ---
    function updateMaxScroll() {
        maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
        maxScrollLeft = Math.max(0, maxScrollLeft); 
        isScrollable = maxScrollLeft > 0;
        
        if (isScrollable) {
            wrapper.style.cursor = 'grab';
            indicator.style.display = 'flex';
        } else {
            wrapper.style.cursor = 'default';
            indicator.style.display = 'none';
        }
    }

    function clamp(value) {
        return Math.max(0, Math.min(value, maxScrollLeft));
    }

    function updateScrollThumb(scrollValue) {
        const trackWidth = track.clientWidth;
        if (maxScrollLeft <= 0) {
            thumb.style.left = '0px';
            thumb.style.width = `${trackWidth}px`;
            return;
        }
        const thumbWidth = (wrapper.clientWidth / wrapper.scrollWidth) * trackWidth;
        thumb.style.width = `${Math.max(thumbWidth, 20)}px`;
        const maxThumbLeft = trackWidth - parseFloat(thumb.style.width);
        const scrollPercentage = scrollValue / maxScrollLeft;
        const thumbLeft = Math.min(Math.max(0, scrollPercentage * maxThumbLeft), maxThumbLeft);
        thumb.style.left = `${thumbLeft}px`;
    }

    // --- LİNKLERİ KORUMA ---
    const links = wrapper.querySelectorAll('a');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // DÜZELTME BURADA:
            // Eğer scroll kapalıysa (büyük ekran), kontrol yapma, direkt linki aç.
            if (!isScrollable) return; 

            // Sadece scroll varsa "sürükleme mi tıklama mı" kontrolü yap
            if (Math.abs(e.pageX - clickStartX) > 5) {
                e.preventDefault(); 
                e.stopPropagation(); 
            }
        });
    });


    // --- OLAY DİNLEYİCİLERİ ---

    // 1. SYNC 
    wrapper.addEventListener('scroll', () => {
        if (!isDown && !isAnimating) {
            currentScroll = wrapper.scrollLeft;
            targetScroll = wrapper.scrollLeft;
            updateScrollThumb(currentScroll);
        }
    });

    // 2. MOUSE TIKLAMA 
    wrapper.addEventListener('mousedown', (e) => {
        if (!isScrollable) return;
        isDown = true;
        isAnimating = true; 
        wrapper.classList.add('active');
        wrapper.style.cursor = 'grabbing';
        
        // Tıklama başlangıç noktasını kaydet
        clickStartX = e.pageX;

        currentScroll = wrapper.scrollLeft;
        targetScroll = currentScroll;
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeftStart = targetScroll;
        
        e.preventDefault(); 
    });

    // 3. MOUSE BIRAKMA 
    window.addEventListener('mouseup', () => {
        if (isDown) {
            isDown = false;
            wrapper.classList.remove('active');
            wrapper.style.cursor = 'grab';
        }
    });

    // 4. MOUSE HAREKETİ
    window.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX) * 1.5; 
        targetScroll = scrollLeftStart - walk;
        targetScroll = clamp(targetScroll);
    });

    // 5. TEKERLEK
    wrapper.addEventListener('wheel', (event) => {
        if (!isScrollable) return; 
        event.preventDefault();
        isAnimating = true;
        targetScroll += event.deltaY * 1.0;
        targetScroll = clamp(targetScroll);
    });

    // 6. RESIZE
    window.addEventListener('resize', () => {
        updateMaxScroll(); 
        targetScroll = clamp(targetScroll); 
        updateScrollThumb(currentScroll); 
    });
    
    window.addEventListener('load', () => {
        updateMaxScroll();
    });

    // --- ANA ANİMASYON DÖNGÜSÜ ---
    function smoothScrollLoop() {
        let delta = targetScroll - currentScroll;
        
        if (Math.abs(delta) > 0.5) {
            currentScroll += delta * easing;
            wrapper.scrollLeft = currentScroll;
            updateScrollThumb(currentScroll);
            isAnimating = true; 
        } else {
            isAnimating = false;
        }
        
        requestAnimationFrame(smoothScrollLoop);
    }

    // --- BAŞLATMA ---
    updateMaxScroll();
    updateScrollThumb(0);
    smoothScrollLoop();
});