import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ShoppingBag, 
  ArrowRight, 
  Menu, 
  X, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Globe,
  Mail,
  Phone,
  ArrowLeft,
  ChevronRight,
  Palette
} from 'lucide-react';
import { supabase } from './supabaseClient';
import AdminDashboard from './components/Admin/Dashboard';
import AdminLogin from './components/Admin/Login';

gsap.registerPlugin(ScrollTrigger);

// --- Shared Utility Components ---



const MagneticWrapper = ({ children, className = "" }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      gsap.to(el, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.3)"
      });
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  );
};

const Navbar = ({ onViewChange, currentView }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 pill-nav 
      ${isScrolled || currentView !== 'home'
        ? 'bg-background/60 backdrop-blur-xl border border-dark/10 py-3 px-6 w-max shadow-2xl translate-y-0' 
        : 'bg-transparent border-transparent py-4 px-6 md:px-8 w-[95%] md:w-[90%] max-w-[1200px] shadow-none translate-y-0'}`}
      style={{ borderRadius: '100px' }}
    >
      <div className="flex items-center justify-between gap-6 md:gap-12">
        <div 
          onClick={() => onViewChange('home')}
          className={`text-xl md:text-2xl font-sans font-bold tracking-tighter transition-colors duration-700 cursor-pointer ${isScrolled || currentView !== 'home' ? 'text-dark' : 'text-primary'}`}
        >
          MAMTA <span className="text-accent">VARIETIES</span>
        </div>

        <div className={`hidden lg:flex items-center gap-8 text-sm font-sans font-medium uppercase tracking-widest transition-colors duration-700 ${isScrolled || currentView !== 'home' ? 'text-dark/70' : 'text-primary/70'}`}>
          <button onClick={() => onViewChange('home')} className="hover:text-accent transition-colors uppercase">Home</button>
          <button onClick={() => onViewChange('home', null, null, '#gallery')} className="hover:text-accent transition-colors uppercase">Collection</button>
          <button onClick={() => onViewChange('home', null, null, '#visit')} className="hover:text-accent transition-colors uppercase">Visit</button>
          <button onClick={() => onViewChange('home', null, null, '#contact')} className="hover:text-accent transition-colors uppercase">Location</button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <a href="https://www.instagram.com/mamtavarities24/" target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full transition-all duration-300 ${isScrolled || currentView !== 'home' ? 'text-dark hover:bg-dark/5' : 'text-primary hover:bg-white/10'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
          </a>
          <MagneticWrapper>
            <button 
              onClick={() => onViewChange('home', null, null, '#contact')}
              className="hidden sm:flex items-center gap-2 bg-accent text-white px-5 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-sans font-bold uppercase tracking-widest btn-slide"
            >
              <span className="bg-layer"></span>
              <span className="btn-content flex items-center gap-2">
                Visit Store <ArrowRight size={14} />
              </span>
            </button>
          </MagneticWrapper>
          <button 
            className={`lg:hidden transition-colors duration-700 ${isScrolled || currentView !== 'home' ? 'text-dark' : 'text-primary'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full mt-4 bg-background border border-dark/10 rounded-3xl p-6 md:p-8 flex flex-col gap-5 md:gap-6 lg:hidden shadow-2xl backdrop-blur-xl bg-white/95 animate-slide-down">
          <button onClick={() => { onViewChange('home'); setMobileMenuOpen(false); }} className="text-xl font-sans font-bold text-dark border-b border-dark/5 pb-2 text-left uppercase">Home</button>
          <button onClick={() => { onViewChange('home', null, null, '#gallery'); setMobileMenuOpen(false); }} className="text-xl font-sans font-bold text-dark border-b border-dark/5 pb-2 text-left uppercase">Collection</button>
          <button onClick={() => { onViewChange('home', null, null, '#visit'); setMobileMenuOpen(false); }} className="text-xl font-sans font-bold text-dark border-b border-dark/5 pb-2 text-left uppercase">Visit Us</button>
        </div>
      )}
    </nav>
  );
};

const Footer = ({ onViewChange }) => {
  return (
    <footer className="bg-dark text-primary rounded-t-[3rem] md:rounded-t-[4rem] px-8 md:px-24 pt-24 pb-12 mt-20 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80')] bg-cover opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-16 pb-20 border-b border-primary/10">
          <div className="md:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-sans font-black tracking-tighter uppercase leading-none">
                MAMTA <span className="text-accent">VARIETIES</span>
              </h2>
              <span className="text-xs font-mono text-accent uppercase tracking-[0.4em] font-bold">Est. 2000</span>
            </div>
            <p className="text-primary/60 font-sans text-sm md:text-base max-w-sm leading-relaxed uppercase tracking-wider italic">
              The premier destination for luxury accessories and curated style essentials in Yavatmal, Maharashtra. Precision eyewear, timeless watches, and signature scents.
            </p>
          </div>
          
          <div className="flex flex-col gap-8">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-accent">Navigation</h4>
            <ul className="flex flex-col gap-5 text-sm font-sans text-primary/70 uppercase tracking-widest font-bold">
              <li><button onClick={() => onViewChange('home')} className="hover:text-accent transition-colors">Home</button></li>
              <li><a href="#gallery" onClick={() => onViewChange('home')} className="hover:text-accent transition-colors">Collection</a></li>
              <li><a href="#visit" onClick={() => onViewChange('home')} className="hover:text-accent transition-colors">Visit Store</a></li>
              <li><a href="#contact" onClick={() => onViewChange('home')} className="hover:text-accent transition-colors">Location</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-8">
            <h4 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-accent">Connect</h4>
            <div className="flex flex-col gap-4">
              <a href="https://wa.me/919766841761?text=Hello%20Mamta%20Varieties!%20I'm%20interested%20in%20your%20collection.%20Can%20you%20help%20me?" className="block">
                <MagneticWrapper className="w-full">
                  <button className="w-full flex items-center justify-between bg-[#25D366] text-white px-6 py-4 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-500">
                    WhatsApp Us <ArrowRight size={14} />
                  </button>
                </MagneticWrapper>
              </a>
              <a href="tel:+919766841761" className="block">
                <MagneticWrapper className="w-full">
                  <button className="w-full flex items-center justify-between border border-primary/20 text-primary px-6 py-4 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest hover:bg-white hover:text-dark transition-all duration-500">
                    Voice Call <Phone size={14} />
                  </button>
                </MagneticWrapper>
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-12 flex flex-col md:flex-row items-center justify-center gap-8">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary/20">
            &copy; 2024 MAMTA VARIETIES. CRAFTED FOR EXCELLENCE.
          </span>
        </div>
      </div>
    </footer>
  );
};

// --- Home Components ---

const Hero = () => {
  const heroRef = useRef(null);
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Parallax text movement on scroll
      gsap.to(".hero-text-content", {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        y: 100,
        opacity: 0,
      });

      // Hero Entrance
      const tl = gsap.timeline();
      tl.from(".hero-text", {
        y: 80,
        opacity: 0,
        duration: 1.4,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.2
      })
      .from(".hero-cta", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, "-=0.8");
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative h-[100dvh] w-full overflow-hidden flex items-end p-8 md:p-24 bg-dark">
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero-essentials.png" 
          alt="Premium Essentials" 
          className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-5xl hero-text-content">
        <h1 className="flex flex-col gap-2 leading-none">
          <span className="hero-text text-primary font-sans font-black text-4xl md:text-7xl uppercase tracking-tighter text-left">
            The Finest
          </span>
          <span className="hero-text text-accent font-drama italic text-7xl md:text-[11rem] leading-[0.8] lowercase text-left">
            Essentials.
          </span>
        </h1>
        <p className="hero-text text-primary/60 font-mono text-sm md:text-base max-w-md mt-6 md:mt-8 uppercase tracking-widest leading-relaxed text-left">
          Curated collection of sunglasses, watches, and premium artifacts for the modern lifestyle.
        </p>
        
        <div className="hero-cta mt-12 flex flex-col md:flex-row items-start md:items-center gap-8">
          <MagneticWrapper>
            <button 
              onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}
              className="bg-accent text-white px-10 py-5 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all duration-500 flex items-center gap-4 group"
            >
              <span>Explore Gallery</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={20} />
            </button>
          </MagneticWrapper>

          <MagneticWrapper>
            <button 
              onClick={() => document.getElementById('visit').scrollIntoView({ behavior: 'smooth' })}
              className="border border-primary/20 text-primary px-10 py-5 rounded-full text-sm font-black uppercase tracking-[0.2em] hover:bg-white hover:text-dark transition-all duration-500 flex items-center gap-4 group"
            >
              <span>Visit Store</span>
              <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={20} />
            </button>
          </MagneticWrapper>
          
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom {
          from { transform: scale(1.05); }
          to { transform: scale(1.15); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
      `}</style>
    </section>
  );
};

const BrandMarquee = () => {
  const brands = ["Ray-Ban", "Tissot", "Oakley", "Gucci", "Prada", "Fossil", "Titan", "Casio", "Seiko", "Fastrack"];
  return (
    <div className="bg-accent py-4 overflow-hidden border-y border-dark/10">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...brands, ...brands, ...brands].map((brand, i) => (
          <div key={i} className="flex items-center mx-12">
            <span className="text-white font-sans font-black text-2xl uppercase tracking-tighter">{brand}</span>
            <div className="w-2 h-2 rounded-full bg-white/30 ml-12"></div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}</style>
    </div>
  );
};

const ProductGallery = ({ onCategorySelect }) => {
  const galleryRef = useRef(null);
  const categories = [
    { name: "Sunglasses", desc: "UV400 Protection", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800" },
    { name: "Watches", desc: "Precision Quartz", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800" },
    { name: "Perfumes", desc: "Signature Scents", img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800" },
    { name: "Caps", desc: "Daily Streetwear", img: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&q=80&w=800" },
    { name: "Optical Frames", desc: "Prescription Ready", img: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800" }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".gallery-card", 
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }, galleryRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="gallery" ref={galleryRef} className="py-24 px-8 md:px-24 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-16 text-left">
          <span className="text-accent font-mono text-xs uppercase tracking-[0.4em]">Product Showcase</span>
          <h2 className="text-5xl font-sans font-black uppercase tracking-tight text-dark">Explore <span className="text-accent font-drama italic lowercase">Categories.</span></h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => onCategorySelect(cat.name)}
              className="gallery-card group relative aspect-[3/4] rounded-[2rem] overflow-hidden border border-dark/5 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
            >
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
              <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-left">
                <span className="text-accent font-mono text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{cat.desc}</span>
                <h4 className="text-white font-sans font-black uppercase tracking-tight text-xl leading-tight">{cat.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const sectionRef = useRef(null);
  const [items, setItems] = useState([
    { id: 1, label: "Precision Optics", sub: "UV400 Certified" },
    { id: 2, label: "Mechanical Flow", sub: "Quartz Accuracy" },
    { id: 3, label: "Frame Engineering", sub: "Structural Acetate" },
  ]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Reveal cards
      gsap.fromTo(".feature-card", 
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
          },
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.2,
          ease: "power3.out"
        }
      );

      // Cursor Protocol Animation
      const cursorTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      
      cursorTl
        .set("#protocol-cursor", { x: 120, y: 120, opacity: 0 })
        .to("#protocol-cursor", { opacity: 1, duration: 0.5 })
        .to("#protocol-cursor", { 
          x: -60, 
          y: -10, 
          duration: 1.5, 
          ease: "power3.inOut" 
        })
        .to("#protocol-cursor", { scale: 0.8, duration: 0.15 })
        .to("#protocol-cursor", { scale: 1, duration: 0.15 })
        .to("#protocol-cursor", { 
          x: 30, 
          y: 70, 
          duration: 1.2, 
          ease: "power3.inOut" 
        })
        .to("#protocol-cursor", { scale: 0.8, duration: 0.15 })
        .set("#scheduler-save", { backgroundColor: "#111111", color: "#F5F3EE" })
        .to("#protocol-cursor", { scale: 1, duration: 0.15 })
        .to("#protocol-cursor", { opacity: 0, y: 150, duration: 0.6, ease: "power2.in" })
        .set("#scheduler-save", { backgroundColor: "rgba(17,17,17,0.05)", color: "rgba(17,17,17,0.2)" }, "+=1.5");

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const newArr = [...prev];
        const last = newArr.pop();
        newArr.unshift(last);
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 px-8 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-20 text-left">
          <span className="text-accent font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Curated Selection</span>
          <h2 className="text-5xl md:text-6xl font-sans font-black uppercase tracking-tighter text-dark">Our <span className="text-accent font-drama italic lowercase">Artifacts.</span></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Style Shuffler */}
          <div className="feature-card group flex flex-col justify-between bg-white border border-dark/10 p-10 rounded-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 text-left min-h-[500px]">
            <div className="relative h-64 w-full flex items-center justify-center overflow-hidden bg-dark/5 rounded-[2rem]">
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  className="absolute transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full max-w-[220px]"
                  style={{
                    transform: `translateY(${(index - 1) * 70}px) scale(${index === 1 ? 1 : 0.8}) rotate(${(index - 1) * 5}deg)`,
                    opacity: index === 1 ? 1 : 0.2,
                    zIndex: index === 1 ? 2 : 1
                  }}
                >
                  <div className="bg-white border border-dark/10 p-6 rounded-2xl shadow-xl flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-accent uppercase font-bold tracking-widest">{item.sub}</span>
                    <span className="text-sm font-sans font-black text-dark uppercase tracking-tight">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-sans font-black text-dark uppercase tracking-tighter leading-none text-left">Timeless <br />Aesthetics</h3>
              <p className="text-xs text-dark/40 font-mono mt-4 leading-relaxed uppercase tracking-widest text-left">
                Curated selection of sunglasses and watches that transcend seasonal trends.
              </p>
            </div>
          </div>

          {/* Quality Typewriter */}
          <div className="feature-card group flex flex-col justify-between bg-white border border-dark/10 p-10 rounded-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 text-left min-h-[500px]">
            <div className="h-64">
              <div className="bg-dark p-8 rounded-[2rem] h-full font-mono text-[10px] text-primary/80 relative overflow-hidden border border-white/5">
                <div className="flex items-center gap-2 mb-6 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                  <span className="text-accent uppercase tracking-widest font-bold">Live Quality Feed</span>
                </div>
                <div className="flex flex-col gap-4 text-left">
                  <p className="leading-relaxed opacity-60 uppercase">Checking Quality Standards...</p>
                  <p className="leading-relaxed">Quality is not a luxury restricted to the few. We provide high-fidelity artifacts without the markup.<span className="w-1.5 h-4 bg-accent inline-block align-middle ml-1 animate-pulse"></span></p>
                  <p className="leading-relaxed opacity-40 uppercase">Quality: Guaranteed</p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-sans font-black text-dark uppercase tracking-tighter leading-none text-left">Affordable <br />Items</h3>
              <p className="text-xs text-dark/40 font-mono mt-4 leading-relaxed uppercase tracking-widest text-left">
                We optimize the supply chain to deliver high-fidelity artifacts without the luxury markup.
              </p>
            </div>
          </div>

          {/* Style Scheduler */}
          <div className="feature-card group flex flex-col justify-between bg-white border border-dark/10 p-10 rounded-[3rem] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 text-left min-h-[500px]">
            <div className="h-64 bg-dark/[0.02] rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden border border-dark/5">
              <div className="grid grid-cols-7 gap-1.5 w-full mb-6">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} id={`day-${i}`} className={`aspect-square rounded-xl border border-dark/5 flex items-center justify-center text-[10px] font-black transition-all duration-500 ${i === 2 ? 'active-day' : 'bg-white text-dark/10'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <button id="scheduler-save" className="bg-dark/5 text-dark/20 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 border border-dark/5 shadow-sm">
                Save Selection
              </button>
              
              {/* Animated SVG Cursor */}
              <div id="protocol-cursor" className="absolute pointer-events-none z-10 opacity-0 drop-shadow-2xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-accent drop-shadow-xl">
                  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>
                </svg>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-sans font-black text-dark uppercase tracking-tighter leading-none text-left">Best <br />Quality</h3>
              <p className="text-xs text-dark/40 font-mono mt-4 leading-relaxed uppercase tracking-widest text-left">
                Rigorous quality checks ensure every piece meets our style and durability standards.
              </p>
            </div>
            
            <style>{`
              .active-day {
                background-color: #38B6E8 !important;
                color: white !important;
                border-color: #38B6E8 !important;
                box-shadow: 0 8px 16px rgba(56, 182, 232, 0.4);
                transform: scale(1.1);
              }
            `}</style>
          </div>
        </div>
      </div>
    </section>
  );
};

const StoreStatus = () => {
  const [status, setStatus] = useState({ open: false, day: "", closingTime: "", timeLeft: "" });

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour * 60 + minute;
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const currentDayName = dayNames[day];

      const start = 10 * 60;
      const endStandard = 21 * 60 + 30;
      const endTuesday = 16 * 60;
      let end = day === 2 ? endTuesday : endStandard;

      if (currentTime >= start && currentTime < end) {
        const diff = end - currentTime;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setStatus({ open: true, day: currentDayName, closingTime: day === 2 ? "4:00 PM" : "9:30 PM", timeLeft: `${h}h ${m}m` });
      } else {
        setStatus({ open: false, day: currentDayName });
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-4 bg-dark/5 p-5 rounded-[2rem] border border-dark/5 text-left">
      <div className={`w-3 h-3 rounded-full ${status.open ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`}></div>
      <div className="flex flex-col gap-0.5">
        <span className={`text-sm font-sans font-black uppercase tracking-widest ${status.open ? 'text-green-600' : 'text-gray-500'}`}>
          {status.open ? 'Store Open' : 'Store Closed'}
        </span>
        {status.open && <span className="text-[10px] font-mono font-bold text-accent uppercase">Closes at {status.closingTime} • IN {status.timeLeft}</span>}
      </div>
    </div>
  );
};

const StoreExperience = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".experience-content > *", 
        { x: -50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
          },
          x: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out"
        }
      );
      
      gsap.fromTo(".experience-image", 
        { x: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
            once: true
          },
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out"
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="visit" ref={sectionRef} className="py-24 px-8 md:px-24 bg-dark text-primary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
          {/* Text Content */}
          <div className="experience-content flex flex-col gap-8 text-left order-2 lg:order-1">
            <div className="flex flex-col gap-4">
              <span className="text-accent font-mono text-[10px] uppercase tracking-[0.4em]">Store Experience</span>
              <h2 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tighter leading-none">
                Visit <br />
                <span className="text-accent font-drama italic lowercase">Our Store.</span>
              </h2>
            </div>
            
            <p className="text-primary/60 font-sans text-lg md:text-xl leading-relaxed max-w-lg italic">
              The best way to choose your next pair of sunglasses or a new watch is to see them in person. Visit our store to try on our latest collection.
            </p>
            
            <div className="mt-8">
              <a href="#contact">
                <MagneticWrapper>
                  <button className="group flex items-center gap-6 bg-primary text-dark px-10 py-5 rounded-full text-sm font-sans font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all duration-500">
                    Locate Store <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </MagneticWrapper>
              </a>
            </div>
          </div>

          {/* Image Content */}
          <div className="experience-image relative order-1 lg:order-2 aspect-[4/5] w-full rounded-[3rem] overflow-hidden border border-primary/10 group">
            <img 
              src="/store-interior.png" 
              alt="Store Experience" 
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

const CategoryView = ({ category, onProductSelect, onBack }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, variants(*)')
        .eq('category', category);
      
      if (error) console.error(error);
      else setProducts(data || []);
      setLoading(false);
      window.scrollTo(0, 0);
    };
    fetchProducts();
  }, [category]);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-24 px-6 md:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-dark/40 hover:text-accent transition-colors font-mono text-[10px] md:text-xs uppercase mb-8 md:mb-12">
          <ArrowLeft size={14} className="md:w-4 md:h-4" /> Back to Collection
        </button>

        <div className="flex flex-col gap-4 mb-12 md:mb-16 text-left">
          <span className="text-accent font-mono text-[10px] md:text-xs uppercase tracking-[0.4em]">Browsing Category</span>
          <h2 className="text-4xl md:text-6xl font-sans font-black uppercase tracking-tight text-dark leading-tight">{category}<span className="text-accent font-drama italic lowercase">.</span></h2>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="text-dark/10" size={64} />
            <p className="text-dark/40 font-mono uppercase text-sm">No products found in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => onProductSelect(product)}
                className="group flex flex-col gap-4 md:gap-6 cursor-pointer"
              >
                <div className="aspect-square rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-dark/5 bg-white shadow-sm group-hover:shadow-2xl transition-all duration-700 group-hover:-translate-y-2">
                  {product.variants?.[0] && (
                    <img 
                      src={product.variants[0].image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                    />
                  )}
                </div>
                <div className="text-left px-1 md:px-2">
                  <span className="text-[9px] md:text-[10px] font-mono text-accent uppercase tracking-widest">{product.variants?.length || 0} Colors</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-dark group-hover:text-accent transition-colors leading-tight">{product.name}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetails = ({ product, onBack }) => {
  const [activeVariant, setActiveVariant] = useState(product.variants?.[0] || null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-24 px-6 md:px-24 bg-white">
      <div className="max-w-7xl mx-auto text-left">
        <button onClick={onBack} className="flex items-center gap-2 text-dark/40 hover:text-accent transition-colors font-mono text-[10px] md:text-xs uppercase mb-8 md:mb-12">
          <ArrowLeft size={14} className="md:w-4 md:h-4" /> Back to {product.category}
        </button>

        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden bg-dark/5 border border-dark/10">
            {activeVariant && (
              <img 
                src={activeVariant.image_url} 
                alt={product.name} 
                key={activeVariant.id}
                className="w-full h-full object-cover animate-fade-in"
              />
            )}
            <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-dark/5 shadow-sm">
              <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest flex items-center gap-2">
                <Palette size={12} /> {activeVariant?.color}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-10 text-left py-4 md:py-8">
            <div>
              <span className="text-accent font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] mb-2 md:mb-4 block">{product.category}</span>
              <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-dark leading-none">{product.name}</h1>
            </div>

            <div className="flex flex-col gap-4 md:gap-6">
              <h4 className="text-[9px] md:text-[10px] font-mono uppercase text-dark/40 tracking-[0.3em]">Description</h4>
              <p className="text-lg md:text-2xl font-sans text-dark/80 leading-relaxed font-medium italic">
                "{product.description}"
              </p>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="text-[10px] font-mono uppercase text-dark/40 tracking-[0.3em]">Available Colors</h4>
              <div className="flex flex-wrap gap-4">
                {product.variants?.map(variant => (
                  <button 
                    key={variant.id}
                    onClick={() => setActiveVariant(variant)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all duration-300 font-sans font-bold text-xs uppercase tracking-widest
                    ${activeVariant?.id === variant.id ? 'border-accent bg-accent text-white scale-105 shadow-lg shadow-accent/20' : 'border-dark/5 hover:border-dark/20 text-dark/60'}`}
                  >
                    <div className={`w-3 h-3 rounded-full ${activeVariant?.id === variant.id ? 'bg-white' : 'bg-dark/10'}`}></div>
                    {variant.color}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-dark/5">
              <a 
                href={`https://wa.me/919766841761?text=Hello%20Mamta%20Varieties!%20I'm%20interested%20in%20the%20*${encodeURIComponent(product.name)}*%20in%20*${encodeURIComponent(activeVariant?.color)}*%20color.%0A%0AImage:%20${encodeURIComponent(activeVariant?.image_url)}%0A%0AIs%20this%20available%20in%20store?`} 
                className="block w-full"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="w-full bg-dark text-primary px-8 py-5 md:py-6 rounded-full font-bold uppercase text-xs md:text-sm tracking-[0.2em] hover:bg-accent transition-colors flex items-center justify-center gap-4 group">
                  Enquire at Store <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
      `}</style>
    </div>
  );
};

// --- Root Application ---

function App() {
  const [view, setView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('p') || params.get('product');

    if (params.get('access') === 'terminal') {
      setView('admin');
      window.history.replaceState({}, document.title, "/");
    } else if (productId) {
      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*, variants(*)')
          .eq('id', productId)
          .single();
        
        if (!error && data) {
          setSelectedProduct(data);
          setView('product');
        }
      };
      fetchProduct();
    }
  }, []);

  const handleViewChange = (newView, category = null, product = null, hash = null) => {
    setView(newView);
    setSelectedCategory(category);
    setSelectedProduct(product);
    setTimeout(() => {
      ScrollTrigger.refresh();
      if (hash) {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }
    }, 100);
  };

  const renderView = () => {
    switch (view) {
      case 'category':
        return <CategoryView category={selectedCategory} onBack={() => setView('home')} onProductSelect={(p) => handleViewChange('product', selectedCategory, p)} />;
      case 'product':
        return <ProductDetails product={selectedProduct} onBack={() => setView('category')} />;
      case 'admin':
        return session ? <AdminDashboard onBack={() => setView('home')} /> : <AdminLogin onBack={() => setView('home')} />;
      default:
        return (
          <>
            <Hero />
            <BrandMarquee />
            <ProductGallery onCategorySelect={(cat) => handleViewChange('category', cat)} />
            <Features />
            <StoreExperience />
            <section id="contact" className="py-16 md:py-24 px-6 md:px-24 bg-background overflow-hidden">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-12 items-start">
                  <div className="flex flex-col gap-8 text-left">
                    <div className="flex flex-col gap-4">
                      <span className="text-accent font-mono text-[10px] uppercase tracking-[0.4em]">Connect & Locate</span>
                      <h2 className="text-4xl md:text-5xl font-sans font-black uppercase tracking-tight text-dark">Find <span className="text-accent font-drama italic lowercase">Us Here.</span></h2>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="p-8 border border-dark/5 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-mono text-accent uppercase font-bold tracking-widest">Main Store</span>
                          <p className="text-lg text-dark/80 font-sans font-bold leading-tight uppercase">Indira Gandhi Market Rd, Yavatmal, Maharashtra 445001</p>
                        </div>
                        <div className="h-[1px] w-full bg-dark/5"></div>
                        <StoreStatus />
                      </div>
                      <div className="flex flex-col gap-3">
                        <a href="https://wa.me/919766841761?text=Hello%20Mamta%20Varieties!%20I'm%20interested%20in%20your%20collection.%20Can%20you%20help%20me?" className="w-full">
                          <button className="magnetic-btn w-full flex items-center justify-between bg-[#25D366] text-white px-8 py-5 rounded-full text-xs font-sans font-bold uppercase tracking-widest">WhatsApp Us <ArrowRight size={16} /></button>
                        </a>
                        <a href="tel:+919766841761" className="w-full">
                          <button className="magnetic-btn w-full flex items-center justify-between bg-dark text-primary px-8 py-5 rounded-full text-xs font-sans font-bold uppercase tracking-widest">Voice Call <Phone size={16} /></button>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-2 h-[450px] md:h-[600px] w-full rounded-[3rem] overflow-hidden border border-dark/10 shadow-2xl relative group">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14959.277873916535!2d78.1326336!3d20.3903321!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd3e8b7cf54bf89%3A0x635fc233f414db75!2sMamta%20Varities!5e0!3m2!1sen!2sin!4v1777881320884!5m2!1sen!2sin" width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="contrast-125 opacity-90 group-hover:opacity-100 transition-all duration-700"></iframe>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  return (
    <div className="relative selection:bg-accent selection:text-white overflow-x-hidden">
      <div className="noise-overlay" />

      {view !== 'admin' && <Navbar onViewChange={handleViewChange} currentView={view} />}
      <main className="font-sans bg-background">{renderView()}</main>
      {view !== 'admin' && <Footer onViewChange={handleViewChange} />}
    </div>
  );
}

export default App;
