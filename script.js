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
    let easing = 0.1;
    let maxScrollLeft = 0;
    let isScrollable = false; // Kaydırmanın aktif olup olmadığını tutar

    // --- YARDIMCI FONKSİYONLAR ---
    function updateMaxScroll() {
        // Genişliği hesapla
        maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
        maxScrollLeft = Math.max(0, maxScrollLeft); 
        isScrollable = maxScrollLeft > 0; // 'true' veya 'false' olarak ayarla
        
        // Sadece İMLEÇ ve GÖSTERGEYİ yönet
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

    // --- OLAY DİNLEYİCİLERİ (DÜZELTİLMİŞ) ---
    
    wrapper.addEventListener('mousedown', (e) => {
        // DÜZELTME: Sadece kaydırılabiliyorsa sürüklemeyi başlat
        if (!isScrollable) return; 
        
        isDown = true;
        wrapper.classList.add('active');
        currentScroll = wrapper.scrollLeft; 
        targetScroll = currentScroll;
        startX = e.pageX - wrapper.offsetLeft;
        scrollLeftStart = targetScroll; 
        e.preventDefault();
    });

    wrapper.addEventListener('mouseleave', () => {
        isDown = false;
        wrapper.classList.remove('active');
    });

    wrapper.addEventListener('mouseup', () => {
        isDown = false;
        wrapper.classList.remove('active');
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - wrapper.offsetLeft;
        const walk = (x - startX);
        targetScroll = scrollLeftStart - walk;
        targetScroll = clamp(targetScroll);
    });

    wrapper.addEventListener('wheel', (event) => {
        // *** ANA DÜZELTME BURADA ***
        // Sadece yatay kaydırma aktifse dikey scroll'u engelle
        if (!isScrollable) {
            return; // Yatay scroll yoksa, hiçbir şey yapma (dikey scroll'a izin ver)
        }
        
        // Sadece yatay scroll aktifken dikey scroll'u engelle
        event.preventDefault(); 
        
        targetScroll += event.deltaY * 1.0;
        targetScroll = clamp(targetScroll);
    });

    window.addEventListener('resize', () => {
        updateMaxScroll(); 
        targetScroll = clamp(targetScroll); 
        updateScrollThumb(currentScroll); 
    });
    
    window.addEventListener('load', () => {
        updateMaxScroll(); // Her şey yüklendikten sonra tekrar hesapla
    });

    // --- ANA ANİMASYON DÖNGÜSÜ ---
    function smoothScrollLoop() {
        let delta = targetScroll - currentScroll;
        
        if (Math.abs(delta) < 0.5) {
            currentScroll = targetScroll;
        } else {
            currentScroll += delta * easing;
        }
        
        wrapper.scrollLeft = currentScroll;
        updateScrollThumb(currentScroll); 
        
        requestAnimationFrame(smoothScrollLoop);
    }

    // --- BAŞLATMA ---
    updateMaxScroll();
    updateScrollThumb(0);
    smoothScrollLoop();
});