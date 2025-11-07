const taslar = {
    'ps': '♟', 'ks': '♜', 'as': '♞', 'fs': '♝', 'vs': '♛', 'ss': '♚',
    'pb': '♙', 'kb': '♖', 'ab': '♘', 'fb': '♗', 'vb': '♕', 'sb': '♔'
};

//tas puanları 
const puanTablosu = { p: 1, a: 3, f: 3, k: 5, v: 9, s: 100 };
let puan = { beyaz: 0, siyah: 0 };

//GLOBAL TANIMLARIM
let seciliHucre = null;
let oyunBitti = false;
let beyazSahOynadiMi = false;
let siyahSahOynadimi = false;
let beyazKaleSolOynadiMi = false;
let beyazKaleSagOynadiMi = false;
let siyahKaleSagOynadiMi = false;
let siyahKaleSolOynadiMi = false;

//global olarak son yapılan piyon hamlesı takibi icin tanımladım.
let gecenPiyon = null;//{x,y} şeklinde tutulacak.
//son hamlede 2 kare ilerleyen piyonun son konumu.


const tahta = document.getElementById("tahta");
//Tahtayı oluştur
for (let y = 0; y < 8; y++) {
    const satir = document.createElement("tr");
    for (let x = 0; x < 8; x++) {
        const hucre = document.createElement("td");
        hucre.dataset.x = x;
        hucre.dataset.y = y;
        hucre.className = (x + y) % 2 === 0 ? "acik" : "koyu";

        // Başlangıç taşları
        let tas = "";
        if (y === 1) tas = "ps";
        if (y === 6) tas = "pb";
        if (y === 0 || y === 7) {
            const renk = y === 0 ? "s" : "b";
            const dizilim = ["k", "a", "f", "v", "s", "f", "a", "k"];
            tas = dizilim[x] + renk;
        }

        if (tas) {
            hucre.dataset.tas = tas;
            hucre.textContent = taslar[tas];
        }

        hucre.addEventListener("click", () => tikla(hucre));
        satir.appendChild(hucre);
    }
    tahta.appendChild(satir);
}
// Oyunun sırasını tutan değişken 
let siraKimde = 'beyaz'; // Oyun beyazla başlar

function tikla(tiklananHucre) {

    if (oyunBitti) {
        alert("Oyun bitti! Lütfen sayfayi yenileyin.");
        return;
    }

    const hedefTas = tiklananHucre.dataset.tas;
    //bir taşın başka bir hücreye hamle yapıp yapamayacağını belirlemek için gerekli bilgiyi alıyor.

    // Bu blok, oyuncu bir taş seçmeye çalıştığında devreye giriyor.
    // Yani: “Henüz hiçbir taşı seçmemişken, bir hücreye tıklanırsa ne olacak?”
    // `seciliHucre` henüz tanımlı değilse (yani oyuncu henüz bir taş seçmediyse),
    // Bu bloğa gireriz.  
    // Başka bir deyişle: **ilk tıklamadaysan**, buradayız.
    if (!seciliHucre) {
        if (hedefTas) {
            const tiklananTasRenk = hedefTas[1] === 'b' ? 'beyaz' : 'siyah';

            // Sıra doğru oyuncudaysa taşı seç
            if (tiklananTasRenk === siraKimde) {
                seciliHucre = tiklananHucre;
                tiklananHucre.style.boxShadow = "inset 0 0 0 2px red";;
            } else {
                alert("Sira sende değil.");
            }
        }
        return;
    }

    // Aynı hücreye tekrar tıklanırsa seçimi kaldır
    if (tiklananHucre === seciliHucre) {
        tiklananHucre.style.boxShadow = "";;
        seciliHucre = null;
        return;
    }

    // Şu an bir taş zaten seçilmişti (seciliHucre vardı).
    // Bu satırla o taşın kodunu alıyoruz (örneğin "pb" = beyaz piyon).
    // Bu bilgiyle, bu taşın rengini ve türünü bileceğiz.
    const seciliTas = seciliHucre.dataset.tas;

    //Aynı renkten başka bir taşa tıklanırsa seçimi değiştir
    //“Seçilen taşın rengiyle tıklanan yeni hücredeki taşın rengi aynı mı?”
    //İlk tıklama: beyaz at (seçildi)
    //Sonra tıklama: beyaz piyon, renkler aynı , seçim değiştirilir.
    if (hedefTas && hedefTas[1] === seciliTas[1]) {
        seciliHucre.style.boxShadow = "";
        seciliHucre = tiklananHucre;//O zaman seçim değiştirilir. Yani yeni tıklanan taş seçilir.
        tiklananHucre.style.boxShadow = "inset 0 0 0 2px red";//Kenarlık güncellenir, eskisinden kaldırılır.
        return;
    }

    // Seçilen taşın sırası mı? Kontrol et
    const seciliTasRenk = seciliTas[1] === 'b' ? 'beyaz' : 'siyah';
    if (seciliTasRenk !== siraKimde) {//O anki sıra kimdeyse karşılaştır
        return;//Eşleşmiyorsa: hiçbir işlem yapılmaz, hamle iptal edilir.
    }

    // secılenın ve hedeftekı Koordinatları alıyorum
    const seciliX = parseInt(seciliHucre.dataset.x);
    const seciliY = parseInt(seciliHucre.dataset.y);
    const hedefX = parseInt(tiklananHucre.dataset.x);
    const hedefY = parseInt(tiklananHucre.dataset.y);

    // Taşın hamlesi kurallara uygun mu kontrol et
    const hamleGecerliMi = hamleKuraliKontrol(seciliTas, seciliX, seciliY, hedefX, hedefY, hedefTas);
    // true ya da false döner.


    //Hamle kurallara uygun değilse (örneğin fil düz gitmeye çalıştıysa),
    //Kullanıcı uyarılır ve işlem iptal edilir.
    if (!hamleGecerliMi) {
        alert("Geçersiz hamle");
        return;
    }
    // Şah durumu bozuluyor mu? kontrolü
    if (sahDurumuBozuluyorMu(seciliTas, seciliX, seciliY, hedefX, hedefY, siraKimde)) {
        alert("Bu hamle kendi sahini tehdit altina sokar!");
        return;
    }

    // Hamle geçerli ise taşı hedefe yerleştir taşı hareket ettir.
    tiklananHucre.dataset.tas = seciliTas;
    tiklananHucre.textContent = taslar[seciliTas];

    const tasTuru = seciliTas[0]; // 'p' mi? tasın tipini alır.
    const tasRenk = seciliTas[1]; // tasın rengını alır.

    //Geçerken alma ise, alınan rakip piyonu arkadaki kareden sil
    let enPassantHedef = null;
    if (tasTuru === 'p' && !hedefTas && Math.abs(hedefX - seciliX) === 1 && (hedefY - seciliY) === (tasRenk === 'b' ? -1 : 1)) {
        enPassantHedef = gecerkenAlmaHedefi(tasRenk, seciliX, seciliY, hedefX, hedefY);
    }
    if (enPassantHedef) {
        const alinanHucre = document.querySelector(`[data-x="${enPassantHedef.x}"][data-y="${enPassantHedef.y}"]`);
        delete alinanHucre.dataset.tas;
        alinanHucre.textContent = "";
    }

    //En passant hakkını güncelle
    if (tasTuru === 'p' && Math.abs(hedefY - seciliY) === 2) {
        // Bu piyon şimdi "geçerken alınabilir"
        gecenPiyon = { x: hedefX, y: hedefY, renk: tasRenk };
    } else {
        // Herhangi başka hamlede bu hak sıfırlanır
        gecenPiyon = null;
    }

    // Piyon terfisi kontrolü vezire terfi edicek!!
    //taş piyon mu diye kontrol edip gerekiyorsa vezir yapacağız.


    if (tasTuru === 'p') {// sadece piyonlar buraya gırcek
        const sonSira = tasRenk === 'b' ? 0 : 7;//Beyaz piyon için son sıra 0,Siyah için 7
        if (hedefY === sonSira) {//son sıraya ulaştı mı diye bakıyoruz?
            const yeniTasKodu = 'v' + tasRenk; // vezir + renk (ör: 'vb')
            tiklananHucre.dataset.tas = yeniTasKodu;
            tiklananHucre.textContent = taslar[yeniTasKodu];
            //Yeni taş kodunu 'vb' ya da 'vs' yapıyoruz.
            //Hücreye bu yeni taşı yerleştiriyoruz.
            alert("Piyon vezire terfi etti!");
        }
    }

    //rok şartlarında “taş oynadı mı?” kontrolü calısması ıcın 
    //ŞAH ICIN YAPTIM 
    if (tasTuru === 's') {
        if (tasRenk === 'b') {
            beyazSahOynadiMi = true;
        } else {
            siyahSahOynadimi = true;
        }

    }

    //KALE ICIN YAPTIM.
    if (tasTuru === 'k') {
        if (tasRenk === 'b') {
            if (seciliX === 7) {
                beyazKaleSagOynadiMi = true;
            } else {
                beyazKaleSolOynadiMi = true;
            }

        } else {
            if (seciliX === 7) {
                siyahKaleSagOynadiMi = true;
            } else {
                siyahKaleSolOynadiMi = true;
            }
        }
    }

    // Önceki hücreyi temizle
    seciliHucre.textContent = "";//Eski hücredeki yazı silinir.
    delete seciliHucre.dataset.tas;//Artık orada taş yok.
    seciliHucre.style.boxShadow = "";;//Kenarlık (seçim çizgisi) kaldırılır.

    // Seçimi kaldır
    seciliHucre = null;//Artık taş seçili değil. Yeni bir seçim yapılana kadar oyun beklemede olur.

    // Sıra değiştir,Sıra karşı tarafa geçer
    siraKimde = siraKimde === 'beyaz' ? 'siyah' : 'beyaz';
    //sıra degısıyor ve bakıyor sah tehdit altında mı?
    if (sahTehditAltindaMi(siraKimde)) {
        if (sahMatMiKontrol(siraKimde)) {
            alert(`Şah Mat! ${siraKimde === 'beyaz' ? 'Siyah' : 'Beyaz'} kazandi!`);
            oyunBitti = true;
        } else {
            alert("Şah çekildi!");
        }
    }


}


function hamleKuraliKontrol(tasKodu, basX, basY, hedefX, hedefY, hedeftekiTas) {
    //tasKodu Seçilen taşın kodu (örnek: `"pb"` piyon beyaz) 
    const tasTuru = tasKodu[0]; // p, k, a, f, v, s
    const tasRengi = tasKodu[1]; // b (beyaz) veya s (siyah)

    const deltaX = hedefX - basX;//(Taşın gitmek istediği yeni pozisyon - Taşın mevcut pozisyonu)
    const deltaY = hedefY - basY;//taşın kaç kare gittiğini tutcak delta


    // Taş capraz ilerleme durumu
    const mutlakX = Math.abs(deltaX);// deger yonlerden dolayı negatıf olabılcegı ıcın math.abs ıle mutlagını aldım.
    const mutlakY = Math.abs(deltaY);//Yani hangi yöne hareket ettiğinden bağımsız olarak **kaç kare oynandığı** bulunur.

    //Piyonun hangi yöne hareket etmesi gerektiği
    //Beyaz taşlar genelde alt taraftan yukarı (satır numarası azalır),
    //Siyah taşlar üst taraftan aşağı (satır numarası artar) hareket eder.
    //Eğer taş beyazsa ; ileriYon = -1 (satır numarası azalacak)
    //Siyahsa ;ileriYon = 1 (satır numarası artacak)
    //Piyon sadece ileri doğru gidebilir.
    //Ama beyaz ve siyahın ileri yönleri ters olduğu için kodda bu ayrım yapılmalı.
    const ileriYon = tasRengi === 'b' ? -1 : 1;
    //Beyaz piyon yukarı (-1), siyah piyon aşağı (+1) hareket eder.

    switch (tasTuru) {



        //PİYON
        case 'p':
            if (basX === hedefX && !hedeftekiTas) {//Piyon düz ileri hareket eder, yani X (yatay) değişmez ve hucrede tas yoksa 
                // İlk hamle: 2 kare ileri
                if ((tasRengi === 'b' && basY === 6 || tasRengi === 's' && basY === 1) && deltaY === 2 * ileriYon) {
                    //Beyaz piyon ilk hamlede satır 6’dadır (satranç tahtasında 7. satır).
                    //Siyah piyon ilk hamlede satır 1’dedir (2. satır).
                    //Eğer taş buradaysa ve hareket 2 kare ileri
                    const aradakiHucre = document.querySelector(`[data-x="${basX}"][data-y="${basY + ileriYon}"]`);
                    //Piyonun ilk hamlesinde 2 kare ileri gidebilmesi için, aradaki hücrenin boş olup olmadığını kontrol ediyoruz.
                    return !aradakiHucre.dataset.tas; // Aradaki hücre boş mu? bossa true doner zaten 
                    //2 kare gitmek için aradaki (1 kare ileri) hücrede taş olmamalı.
                }
                // Normal 1 kare ileri
                return deltaY === ileriYon;
            }

            // Piyonun çapraz yeme hareketi
            if (mutlakX === 1 && deltaY === ileriYon && hedeftekiTas && hedeftekiTas[1] !== tasRengi) {
                //1 kare çapraz(mutlak (capraz) ileriyön 1 ), hedefte tas var mı ve tas varsa rengı farklı mı 
                return true;//true don yanı hamleyı yap.
            }

            //gecerken alma fonksiyonu
            //hedef kare boş, ama yan karede az önce 2 giden rakip piyon var.
            if (mutlakX === 1 && deltaY === ileriYon && !hedeftekiTas) {
                const gp = gecerkenAlmaHedefi(tasRengi, basX, basY, hedefX, hedefY);
                if (gp) return true; // şekil doğru ve gerçekten 'geçerken alma' mümkün
            }

            // gecerken alma fonksiyonu Bu fonksiyon sadece kurala uygunluğa bakıyor.
            //  “Hangi piyonu sileceğiz?” bilgisini burada global’e yazmıyoruz. 
            // Bunun yerine, birazdan tikla ve 
            // sahDurumuBozuluyorMu içinde aynı gecerkenAlmaHedefi(...) ile tespit edip DOM’dan siliyoruz. 
            // Böylece kontrol fonksiyonu yan etki bırakmıyor.

            return false;



        //KALE
        case 'k': // Kale: sadece yatay veya dikey gider
            if (basX !== hedefX && basY !== hedefY) return false;
            //Eğer hem X hem Y değişmişse çapraz gitmiş demektir return false
            return aradakiYolBosMu(basX, basY, hedefX, hedefY);
        //Düz gidiyorsa, aradaki kareler boş mu diye kontrol edilir.

        //AT
        case 'a': // At: L şeklinde gider
            return (mutlakX === 2 && mutlakY === 1) || (mutlakX === 1 && mutlakY === 2);
        //Bu taş üstünden atlar, bu yüzden aradaki yol kontrolüne gerek yok.

        //FİL
        case 'f': // Fil: sadece çapraz gider
            if (mutlakX !== mutlakY) return false;
            //X ve Y yönündeki hareket miktarı eşit olmalı degılse false dondur.
            return aradakiYolBosMu(basX, basY, hedefX, hedefY);
        //Sonra aradaki kareler boş mu bakıcam.

        //VEZİR
        //Kural: Vezir hem kale gibi hem fil gibi gider.
        case 'v': // Vezir: hem çapraz hem düz gider
            if (basX === hedefX || basY === hedefY || mutlakX === mutlakY) {
                //Düz (X ya da Y aynı) veya
                //Çapraz (X ve Y farkı eşit) bunlara uyuyorsa yolbosmufonks yolla
                return aradakiYolBosMu(basX, basY, hedefX, hedefY);
            }
            return false;//sartı saglamıyorsa hareket edemez.

        case 's': // Şah: tüm yönlerde sadece 1 kare
            if (mutlakX <= 1 && mutlakY <= 1) {
                // Gitmek istediği karede kendi rengınde birtaşı varsa gitmiyor.
                if (hedeftekiTas && hedeftekiTas[1] === tasRengi) return false;
                return true;
            }
            // ==== ROK HAMLESİ BURADA KONTROL EDİLİR ====
            // Şah 2 kare sağa ya da sola gidiyorsa, rok denemesi olabilir
            if (basY === hedefY && mutlakX === 2 && mutlakY === 0) {
                return rokGecerliMi(tasRengi, basX, basY, hedefX);
            }
            return false;
        default:
            return false;
    }
}

//Kale, fil, vezir için onemlıdır bu fonks Bu taşlar birden fazla kare hareket eder.
//taşın gitmek istediği hedef kareye kadar olan yolunun boş olup olmadığını kontrol ettiğim fonks.
function aradakiYolBosMu(basX, basY, hedefX, hedefY) {
    //hareketın yonunu bulmak ıcın math.sign kullandım.
    const adimX = Math.sign(hedefX - basX);
    const adimY = Math.sign(hedefY - basY);
    // Sağa git	+1	0
    // Sola git	-1	0
    // Yukarı git	0	-1
    // Aşağı git	0	+1
    // Çapraz sağ aşağı	+1	+1
    // Çapraz sol yukarı	-1	-1

    console.log(adimX);
    console.log(adimY);
    console.log(hedefX);
    console.log(hedefY);


    let x = basX + adimX;
    let y = basY + adimY;
    //  Yani hedefe doğru ilk adımı atmaya hazırlanıyoruz.
    // (Sıfırdan değil, başlangıç noktasının bir adım ilerisinden başlıyoruz.)



    // Hedefe ulaşmadan her adımı kontrol et
    //Hedefe ulaşana kadar her kareyi tek tek kontrol eder.
    while (x !== hedefX || y !== hedefY) {
        console.log(x);
        console.log(y);

        const araHucre = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);//aradakı hucrenını x ve y koordınatını alır.
        if (araHucre.dataset.tas) return false; // Taş varsa yol kapalı çık.
        //dataset.tas varsa → orada bir taş var demektir yol tıkalı return false

        x += adimX;
        y += adimY;
    }
    return true; // Yol boş Hiçbir engel çıkmazsa yol devam eder ıslem olur döngü biter
}

// SAHI BULMA FONKSYİYONUM
function sahiBul(renk) {
    const tumHucreler = document.querySelectorAll("td");
    for (let hucre of tumHucreler) {
        const tas = hucre.dataset.tas;
        if (tas && tas[0] === 's' && (tas[1] === (renk === 'beyaz' ? 'b' : 's'))) {
            return hucre;
        }
    }
    return null; // Şah bulunamadıysa
}

//  SAH TEHDIT ALTINDAMI??
function sahTehditAltindaMi(renk) {
    const sahHucre = sahiBul(renk);
    console.log(sahHucre);

    if (!sahHucre) return false; // Şah yoksa (örn: yenilmiş)

    const tumHucreler = document.querySelectorAll("td");
    for (let hucre of tumHucreler) {
        const tas = hucre.dataset.tas;
        if (!tas) continue;

        const tasRenk = tas[1] === 'b' ? 'beyaz' : 'siyah';
        if (tasRenk === renk) continue; // Aynı renkten taşlar şahı tehdit etmez atla gec.

        const x1 = parseInt(hucre.dataset.x);
        const y1 = parseInt(hucre.dataset.y);
        const x2 = parseInt(sahHucre.dataset.x);
        const y2 = parseInt(sahHucre.dataset.y);

        if (hamleKuraliKontrol(tas, x1, y1, x2, y2, sahHucre.dataset.tas)) {
            return true; // Rakip bir taş şahı tehdit ediyor
        }
    }

    return false; // Hiçbir taş tehdit etmiyor
}

function sahMatMiKontrol(renk) {
    console.log(renk);

    const hucreler = document.querySelectorAll("td");
    //Tüm tahta hücrelerini (64 kareyi) seçiyoruz. Bunların her biri bir <td> elementi.

    for (let hucre of hucreler) {
        // Tahtadaki her hücreyi sırayla kontrol et.
        const tas = hucre.dataset.tas;
        if (!tas) continue;//hucrede tas yoksa bu kareyı atla!!

        const tasRenk = tas[1] === 'b' ? 'beyaz' : 'siyah';//tasın rengıne bak.
        if (tasRenk !== renk) continue;//tas oyuncunun tası degılse ,bu tası atla.
        // bu koda bak
        //Sadece renk oyuncusunun taşlarını ele al


        //tasın bulundugu konum koordınatları
        const x1 = parseInt(hucre.dataset.x);
        const y1 = parseInt(hucre.dataset.y);

        //Tahtadaki her kareyi potansiyel hedef olarak düşünüyoruz.
        //Eğer hedef karede kendi rengimizden bir taş varsa, oraya hamle yapamayız 
        //Şimdi her taş için tüm tahtadaki karelere potansiyel hamle olarak bak.
        for (let hedef of hucreler) {
            const hedefTas = hedef.dataset.tas;//icerikteki tası al.
            if (hedefTas && hedefTas[1] === tas[1]) continue;//hedef karede aynı tas renk var ıse atla bu hucreyı.


            //koordinatlarını al hucredekı tasın eger sarta uyduysa 
            //Bu taş, bu kareye kurallara uygun olarak gidebilir mi?
            //(Hamle kuralına göre örn: at L şekli, piyon ileri çapraz vs.)
            const x2 = parseInt(hedef.dataset.x);
            const y2 = parseInt(hedef.dataset.y);

            // Sadece kurallara uygun hamle varsa, mat değil deriz
            if (hamleKuraliKontrol(tas, x1, y1, x2, y2, hedefTas)) {
                //Hamle kuralı uygun olsa da bu hamle sonrası şah tehdit altındaysa geçersiz sayılır.

                //SİMİLASYON GECICI HAREKET!!!
                //Bu yüzden tahtayı geçici olarak değiştiriyorum.

                const eskiTas = hedef.dataset.tas;
                hucre.dataset.tas = "";//Taşı bulunduğu yerden kaldırıyoruz.
                hucre.textContent = "";//Aynı zamanda yazısını da siliyoruz.

                hedef.dataset.tas = tas;//Taşı hedef kareye koyuyoruz (hamleyi yapmış gibi).
                hedef.textContent = taslar[tas];//Yazıyı da güncelliyoruz.

                // Hamle sonrası şah tehdit altında mı?
                const sahTehdidi = sahTehditAltindaMi(renk);
                //Bu hamleden sonra şah hala tehdit altında mı?
                //Eğer tehdit varsa ; hamle geçersiz demektir.
                //Yoksa ; bu hamleyle şah kurtulabiliyor demektir.
                //Tahtayı eski haline getiriyoruz
                hucre.dataset.tas = tas;//Taşı geri eski yerine koyuyoruz.
                hucre.textContent = taslar[tas];

                //Hedef karede eskiden bir taş varsa onu geri koy.
                if (eskiTas) {
                    hedef.dataset.tas = eskiTas;
                    hedef.textContent = taslar[eskiTas];
                } else {//Eğer boşsa boş bırak.
                    delete hedef.dataset.tas;
                    hedef.textContent = "";
                }

                // Eğer bu hamleyle şah kurtuluyorsa, mat değildir. Direkt cık.
                if (!sahTehdidi) return false;
            }
        }
    }

    return true; // Hiçbir taşın yapabileceği hamle yok, ŞAH MAT!
}

function sahDurumuBozuluyorMu(tas, basX, basY, hedefX, hedefY, renk) {
    const basHucre = document.querySelector(`[data-x="${basX}"][data-y="${basY}"]`);
    const hedefHucre = document.querySelector(`[data-x="${hedefX}"][data-y="${hedefY}"]`);

    // Geçici simülasyon: taşını eski yerinden kaldır
    basHucre.dataset.tas = "";
    basHucre.textContent = "";

    // Hedefteki taşı kaydet (piyon alımı ya da boş hücre durumu)
    const eskiTas = hedefHucre.dataset.tas;

    // Taşı hedefe koy
    hedefHucre.dataset.tas = tas;
    hedefHucre.textContent = taslar[tas];
    // --- En passant simülasyonu: eğer bu hamle en passant ise, yan karedeki rakip piyonu geçici sil ---
    let gpSilHucre = null;
    let gpSilKod = null;
    if (tas[0] === 'p') {
        const gp = gecerkenAlmaHedefi(tas[1], basX, basY, hedefX, hedefY);
        // Hedef kare boşsa (eskiTas yok) ve şekil uygunsa, bu geçerken alma simülasyonudur.
        if (!eskiTas && gp) {
            gpSilHucre = document.querySelector(`[data-x="${gp.x}"][data-y="${gp.y}"]`);
            if (gpSilHucre) {
                gpSilKod = gpSilHucre.dataset.tas;
                delete gpSilHucre.dataset.tas;
                gpSilHucre.textContent = "";
            }
        }
    }

    // En passant ile geçici sildiğimiz piyonu geri koy
    if (gpSilHucre && gpSilKod) {
        gpSilHucre.dataset.tas = gpSilKod;
        gpSilHucre.textContent = taslar[gpSilKod];
    }

    // Debug için: console.log('Simule edilen hamle:', {...});
    // debugger;

    // Simülasyon sonrası şah tehdit altında mı kontrol et
    const tehditVarMi = sahTehditAltindaMi(renk);

    // Tahtayı eski haline getir
    basHucre.dataset.tas = tas;
    basHucre.textContent = taslar[tas];

    if (eskiTas) {
        hedefHucre.dataset.tas = eskiTas;
        hedefHucre.textContent = taslar[eskiTas];
    } else {
        delete hedefHucre.dataset.tas;
        hedefHucre.textContent = "";
    }

    return tehditVarMi;
}

//ROK(CASTLİNG) :Rok, şah ve kalenin aynı anda hareket ettiği özel bir hamledir.
// Şah ilk kez oynuyor olmalı
// İlgili kale ilk kez oynuyor olmalı
// Şah ile kale arasında hiç taş olmamalı(aradakiYolBosMu ile kontrol edebılırım.)
// Şah geçeceği veya geleceği karelerde şah tehdidi (şah çekilme) altında olmamalı bunu da sahTehditAltindaMi() ile sorgularım.
// Rok şah tarafından başlatılır
// Rok, şah ile kale aynı anda hareket ettiği için
// senin hamleKuraliKontrol içinde şah için mutlakX === 2 olduğunda çağıracağız.
// yukarıda globallerı tanımladım.


// ===== ROK KONTROLÜ =====
// Amaç: Seçili şahın (konumu basX, basY) iki kare sağa/sola gitme denemesi 
// fonksiyonum gerçek bir rok mu ve kurallara uygun mu diye true/false döndürür.
// renk: Taşın rengi ('b' = beyaz, 's' = siyah).
// basX, basY :Şahın şu an bulunduğu koordinatlar.
// hedefX : Şahın gitmek istediği X konumu (rok yapılacaksa ya 2 kare sağa ya da 2 kare sola gider).
function rokGecerliMi(renk, basX, basY, hedefX) {

    const beyazMi = (renk === 'b');//Sahibi beyaz mı?
    //oynayan taşın rengi beyaz b ise beyazMi = true, siyah ise beyazMi = false.


    //sah durum kontrolu
    //Rok için şah hiç oynamamış olmalı.
    let sahOynamadi;
    if (beyazMi) {
        sahOynamadi = !beyazSahOynadiMi; //beyazMi true (yani taş beyazsa) !beyazSahOynadiMi kullanılır.
    } else {
        sahOynamadi = !siyahSahOynadimi;//Eğer beyazMi false (yani taş siyahsa)!siyahSahOynadimi kullanılır.
    }

    // Şah daha önce oynadıysa iptal
    if (!sahOynamadi) return false;
    //Şah daha önce oynadıysa false.
    //Sonuç olarak sahOynamadi değişkeni true ise bu şah daha önce hiç oynamamış demektir.
    //False ise şah daha önce en az 1 kez oynamıştır (rok hakkı gitmiş demektir).


    // Sağ rok mu sol rok mu?
    const sagaRok = (hedefX > basX);
    //Şah iki kare sağa mı gidiyor, sola mı?
    //Sağ ise true, sol ise false döndürüyorum.


    // Kale durumu kontrol edelım hareket etmemıs olmalı.
    if (beyazMi) {//eyaz şah rok yapmaya çalışıyorsa burası calısır.
        if (sagaRok && beyazKaleSagOynadiMi) return false;
        //sağ rok yapılıyorsa ve beyaz kale true ıse yanı oynadıysa bu false doner cık.
        if (!sagaRok && beyazKaleSolOynadiMi) return false;
        //sola rok yapılıyorsa ve beyaz kale true ıse yanı oynadıysa bu false doner cık.
    } else {//siyah sah rok yapmaya calısıyorsa burası calısır.
        if (sagaRok && siyahKaleSagOynadiMi) return false;
        //sağ rok yapılmak ıstenıyor ve siyah kale true ıse yanı oynadıysa bu false doner cık.
        if (!sagaRok && siyahKaleSolOynadiMi) return false;
    }

    // Arada taş var mı?
    const kaleX = sagaRok ? 7 : 0;//beyaz taslar yukarıda oldugu ıcın kalenın x kordt belıyorumm.
    //Sağ rok ise kale satırın sağ köşesinde (x = 7), sol rok ise kale sol köşede (x = 0).

    //yol bos mu ?
    if (!aradakiYolBosMu(basX, basY, kaleX, basY)) return false;

    //sah tehdıt altında mı?
    // Şah geçerken veya vardığı karede tehdit altında mı?
    const adimYon = sagaRok ? 1 : -1;
    //Sağ rok yapılıyorsa şah +1 x yönünde ilerleyecek,
    //Sol rok ise şah -1 x yönünde ilerleyecek.



    //i = 0 : Şahın bulunduğu kare
    //i = 1 : Şahın geçerken bastığı kare
    //i = 2 : Şahın rok sonrası vardığı kare

    //bu uc durumda da sah durumu bouluyor mu bakmam lazım
    for (let i = 0; i <= 2; i++) {
        const x = basX + i * adimYon;//hedefimin x koordınatını buluyorum.
        if (sahDurumuBozuluyorMu('s' + renk, basX, basY, x, basY, (beyazMi ? 'beyaz' : 'siyah'))) {
            return false;//rok iptal sah durumu bozulmus.
        }//saglamıyorsa sıkıntı yok sah durumu bozulmuyor.
    }


    if (Math.abs(hedefX - basX) === 2) {
        if (hedefX > basX) {
            // Kısa rok
            const kaleHucre = document.querySelector(`[data-x="7"][data-y="${basY}"]`);
            const yeniKaleHucre = document.querySelector(`[data-x="5"][data-y="${basY}"]`);
            const sahHucre = document.querySelector(`[data-x="${basX}"][data-y="${basY}"]`);
            const yeniSahHucre = document.querySelector(`[data-x="${hedefX}"][data-y="${basY}"]`)

            yeniKaleHucre.dataset.tas = kaleHucre.dataset.tas;
            yeniKaleHucre.textContent = taslar[yeniKaleHucre.dataset.tas];

            yeniSahHucre.dataset.tas = sahHucre.dataset.tas;
            yeniSahHucre.textContent = taslar[yeniSahHucre.dataset.tas];

            delete kaleHucre.dataset.tas;
            delete sahHucre.dataset.tas;

            kaleHucre.textContent = "";
            sahHucre.textContent = "";
        } else {
            // Uzun rok
            const kaleHucre = document.querySelector(`[data-x="0"][data-y="${basY}"]`);
            const yeniKaleHucre = document.querySelector(`[data-x="3"][data-y="${basY}"]`);
            const sahHucre = document.querySelector(`[data-x="${basX}"][data-y="${basY}"]`);
            const yeniSahHucre = document.querySelector(`[data-x="${hedefX}"][data-y="${basY}"]`)

            yeniKaleHucre.dataset.tas = kaleHucre.dataset.tas;
            yeniKaleHucre.textContent = taslar[yeniKaleHucre.dataset.tas];

            yeniSahHucre.dataset.tas = sahHucre.dataset.tas;
            yeniSahHucre.textContent = taslar[yeniSahHucre.dataset.tas];
            delete kaleHucre.dataset.tas;
            delete sahHucre.dataset.tas;
            kaleHucre.textContent = "";
            sahHucre.textContent = "";
        }
    }

    return true;//rok şartları tamam

}


//EN PASSANT: Geçerken Alma
//Sadece piyonlarla yapılır.
//Rakip piyon ilk hamlesinde 2 kare ileri oynamış olmalı.
//Bunu yakalamak için global bir değişken (sonHamle) ile son oynanan taşın bilgilerini tutacağız.
//Senin piyonun o piyonun yanındaki sütunda ve aynı sırada olmalı.
//Hemen sonraki hamlede çapraz yeme hareketi yaparak rakip piyonu alırsın.
//Bu hamlede hedef kare aslında boş olur ama rakip piyon arkada kalır ve onu da sileriz.

//gorevler:
//Global değişken — hangi piyonun geçerken alınabileceğini tutmak için.
//Hamle sonrası ayarlama — piyon iki kare ilerlerse işaretlemek.
//Piyon hamle kontrolü — geçerken alma hamlesini algılamak.
//Hamle uygulama — geçerken alındığında rakip piyonu silmek.



// ===== GEÇERKEN ALMA HEDEFİ =====
// Amaç: Oynayan piyonun (basX, basY) -> (hedefX, hedefY) hamlesi
// "geçerken alma" ise, silinecek rakip piyonun karesini {x,y} döndür.
// Değilse null döndürür. DOM'a dokunmaz; sadece mantık kontrolü yapar.

function gecerkenAlmaHedefi(tasRengi, basX, basY, hedefX, hedefY) {

    //Daha önce 2 kare ilerleyen bir piyon yoksa, geçerken alma mümkün değildir.
    if (!gecenPiyon) return null;

    //Oynayan piyonun ileri yönü:
    //beyaz yukarı (-1), siyah aşağı (+1)
    const ileriYon = tasRengi === 'b' ? -1 : 1;

    //Geçerken alma hamlesinin şekli: 1 sağ/sol + 1 ileri olmalı.
    //(hedefX - basX) mutlak 1, (hedefY - basY) tam olarak ileriYon olmalı.
    if (Math.abs(hedefX - basX) !== 1 || (hedefY - basY) !== ileriYon) return null;

    //Yanımızdaki rakip piyonun konumu, bizim "başlangıç satırımızda"
    //ve "hedef sütunumuzda" olmalı:
    //Yani o piyon (hedefX, basY) karesindedir.
    const yanyanaMi = (gecenPiyon.x === hedefX && gecenPiyon.y === basY);

    //Renkler rakip olmalı: kendi rengimizle aynı renkse geçersiz.
    const rakipMi = (gecenPiyon.renk !== tasRengi);

    //Şartlar tutuyorsa, silinecek piyonun koordinatını döndür.
    //(Geçerken almada hedef kare boştur, ama silinecek piyon "arkadaki karede" kalır.)
    return (yanyanaMi && rakipMi) ? { x: hedefX, y: basY } : null;
}


//ÇALISMA MANTIĞI
// Bir piyon ilk hamlesinde 2 kare ilerlerse: gecenPiyon = {x,y,renk} olarak işaretlenir.
// Rakibin hemen sonraki hamlesinde, piyonun çapraz ve ileri 1 kare boş kareye gitmesi durumunda
// gecerkenAlmaHedefi(...) o boş hamlenin aslında “en passant” olup olmadığını kontrol eder.
// Gerçek hamlede (tikla), bu tespit doğruysa hedefe piyon yerleştirildikten sonra yan karedeki rakip piyon DOM’dan silinir.
// Simülasyonda (sahDurumuBozuluyorMu) da aynı mantıkla geçici olarak silip geri koyarız; böylece şah kontrolü doğru çıkar.
// Başka herhangi hamlede gecenPiyon sıfırlanır; hak tek hamleliğe mahsustur.