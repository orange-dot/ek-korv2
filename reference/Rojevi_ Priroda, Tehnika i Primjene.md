# **Sveobuhvatna studija dinamike roja: Konvergencija biološke samoorganizacije i inženjerske distribuirane inteligencije**

## **1\. Uvod: Epistemološki i ontološki okvir pojma roja**

U suvremenom znanstvenom diskursu, pojam "roj" (eng. *swarm*) transcendirao je svoju izvornu biološku definiciju i evoluirao u fundamentalnu paradigmu za razumijevanje složenih adaptivnih sustava. Tradicionalno promatran kroz prizmu entomologije i etologije kao puko agregatno stanje insekata ili ptica, roj danas predstavlja konceptualni most koji povezuje nelinearnu dinamiku u fizici, decentralizirane algoritme u računarstvu i autonomnu koordinaciju u robotici. Suština fenomena roja ne leži u pukom zbroju jedinki, već u emergentnom svojstvu kolektivne inteligencije (SI – *Swarm Intelligence*), gdje se sofisticirano globalno ponašanje spontano manifestira iz lokalnih interakcija jednostavnih agenata, lišenih središnje kontrole ili sveobuhvatnog znanja o stanju sustava.1

Istraživanje ovog fenomena zahtijeva rigorozan multidisciplinarni pristup. Biološki sustavi, polirani milijunima godina evolucijske selekcije, nude "dokaz koncepta" za robusnost i fleksibilnost decentralizacije.3 Mravi koji grade mostove od vlastitih tijela, pčele koje demokratski odlučuju o novom staništu, ili jata riba koja manevriraju kao jedinstveni fluid, demonstriraju algoritamsku efikasnost koju inženjeri nastoje replicirati. S druge strane, tehnička implementacija ovih principa – od optimizacije telekomunikacijskih mreža do vođenja rojeva nano-robota kroz ljudski krvotok – povratno informira biologiju, nudeći nove modele za testiranje hipoteza o socijalnom ponašanju.4

Ovaj izvještaj pruža iscrpnu analizu dihotomije i sinergije između prirodnog i umjetnog roja. Detaljno će se razložiti mehanizmi poput stigmergije i kvorumskog odlučivanja, matematički formalizmi optimizacijskih algoritama, inženjerski izazovi u konstrukciji autonomnih rojeva, te duboke etičke implikacije uvođenja autonomnih rojeva u vojne i civilne sfere. Cilj je dekonstruirati mehanizme koji omogućuju da "glupi" dijelovi stvore "pametnu" cjelinu i istražiti kako ta tranzicija redefinira granice tehnoloških mogućnosti u 21\. stoljeću.6

## ---

**2\. Biološki roj: Evolucijski inženjering i mehanizmi koordinacije**

Priroda je, kroz proces prirodne selekcije, razvila decentralizaciju kao odgovor na ograničenja individualne kognicije i percepcije. U okruženjima gdje su resursi raspršeni, a prijetnje sveprisutne, kolektivna inteligencija nudi superiornu strategiju preživljavanja u usporedbi sa solitarnim načinom života.

### **2.1. Fundamentalni principi: Samoorganizacija i emergencija**

Samoorganizacija u biološkim sustavima nije magičan proces, već rezultat dinamičke interakcije četiriju osnovnih komponenti: pozitivne povratne sprege, negativne povratne sprege, fluktuacija i višestrukih interakcija.3

* **Pozitivna povratna sprega (Amplifikacija):** Ovo je mehanizam rasta i regrutacije. Kada mrav pronađe izvor hrane i položi feromonski trag, to privlači druge mrave. Što više mrava koristi taj put, to je mirisni trag jači, što privlači još više mrava. To je autokatalitički proces koji pretvara slučajno otkriće u organiziranu akciju.8  
* **Negativna povratna sprega (Stabilizacija):** Bez ograničenja, pozitivna povratna sprega dovela bi do kaosa ili iscrpljenosti. Negativni mehanizmi uključuju isparavanje feromona, zasićenje broja radnika na određenom zadatku ili fizičku gužvu. Ovo osigurava da sustav ne ostane "zaglavljen" na starim rješenjima kada se uvjeti promjene.3  
* **Slučajnost i fluktuacije:** Biološki agenti nisu savršeni strojevi; oni griješe, lutaju i gube se. Paradoksalno, te "pogreške" su ključne za inovaciju. Slučajno odstupanje mrava s utabane staze može dovesti do otkrića novog, bogatijeg izvora hrane. U kontekstu roja, šum u sustavu je izvor adaptibilnosti.3

Emergencija je produkt ovih interakcija. Jedinka u roju djeluje na temelju lokalnih informacija – položaja susjeda, koncentracije kemikalija ili strujanja zraka – nesvjesna globalnog obrasca koji stvara. Jato čvoraka koje izvodi kompleksne manevre izbjegavanja predatora (fenomen *murmuration*) ne slijedi zapovijedi vođe; svaka ptica jednostavno reagira na kretanje svojih sedam najbližih susjeda, rezultirajući valovitim kretanjem koje zbunjuje napadača.9

### **2.2. Stigmergija: Arhitektura bez arhitekta**

Koncept stigmergije, koji je 1959\. uveo francuski biolog Pierre-Paul Grassé proučavajući termite, predstavlja kamen temeljac razumijevanja indirektne koordinacije. Riječ dolazi od grčkih riječi *stigma* (znak, ubod) i *ergon* (rad), označavajući "rad potaknut znakovima".3

Stigmergija objašnjava kako tisuće insekata mogu izgraditi termitnjake visoke nekoliko metara, s kompleksnim sustavima ventilacije i regulacije vlage, bez nacrta ili nadzora. Radnja jednog agenta ostavlja trag u okolini (npr. postavljanje grumena zemlje natopljenog feromonom). Taj trag mijenja senzornu sliku okoline za druge agente, stimulirajući ih da izvedu specifičnu radnju (npr. postavljanje novog grumena na vrh postojećeg).

Postoje dva oblika stigmergije:

1. **Sematektonička stigmergija:** Sama promjena fizičkog stanja okoline diktira daljnje ponašanje. Na primjer, u gradnji gnijezda ose, prisutnost određenog broja ćelija u redu okida ponašanje započinjanja novog reda. Nema potrebe za kemijskim signalima; struktura sama je poruka.3  
2. **Stigmergija temeljena na znakovima (Marker-based):** Agenti ostavljaju kemijske signale (feromone) koji nemaju fizičku funkciju u gradnji, ali služe kao navigacijske upute. Ovo je dominantno u traženju hrane kod mrava (problem trgovačkog putnika u prirodi).8

Ovaj mehanizam omogućuje **skalabilnost** i **robusnost**. Budući da je informacija pohranjena u okolini, a ne u memoriji agenata, gubitak dijela populacije ne dovodi do gubitka informacija o zadatku. Okolina služi kao dijeljena vanjska memorija roja.

### **2.3. Kolektivna kognicija: Kvorum i demokracija kod pčela**

Pčele medarice (*Apis mellifera*) pružaju jedan od najsofisticiranijih primjera grupnog odlučivanja, posebice tijekom procesa rojenja (fission), kada se dio kolonije s maticom odvaja tražeći novi dom. Istraživanja Thomasa Seeleyja otkrila su da je ovaj proces iznimno sličan neurološkim procesima odlučivanja u mozgu primata, gdje se grupe neurona natječu za aktivaciju.11

Proces odlučivanja odvija se kroz nekoliko faza:

1. **Eksploracija:** Nekoliko stotina pčela izviđača (scouts) pretražuje okolinu (do 70 km²) tražeći šupljine.  
2. **Oglašavanje i debata:** Izviđači se vraćaju u roj i izvode "ples" (waggle dance). Kut plesa označava smjer, trajanje označava udaljenost, a intenzitet i broj ponavljanja označavaju kvalitetu lokacije. Više različitih lokacija se "oglašava" istovremeno.12  
3. **Inhibicija i natjecanje:** Pčele koje promoviraju jednu lokaciju mogu fizički ometati pčele koje plešu za drugu lokaciju (stop signals), što je ekvivalent inhibitornim vezama u neuronskim mrežama.  
4. **Kvorum (Quorum Sensing):** Ključni moment nije postizanje apsolutnog konsenzusa (100% slaganja), što bi bilo vremenski neučinkovito. Umjesto toga, pčele koriste prag kvoruma. Kada se na određenoj potencijalnoj lokaciji skupi dovoljan broj izviđača (osjete jedni druge fizičkim kontaktom), oni se vraćaju u roj i iniciraju signal za polijetanje ("piping").

Ovaj mehanizam "osjeta kvoruma" balansira potrebu za točnošću (odabirom najbolje lokacije) i brzinom (izbjegavanjem izloženosti vremenskim nepogodama). Studije pokazuju da pčele gotovo nepogrešivo biraju najbolju od ponuđenih lokacija, čak i kada su razlike u kvaliteti minimalne, demonstrirajući da je kolektivna mudrost veća od zbroja individualnih procjena.12

### **2.4. Evolucijske prednosti agregacije**

Zašto je evolucija favorizirala formiranje rojeva unatoč rizicima poput lakšeg prijenosa bolesti i kompeticije za resurse unutar grupe? Matematički modeli i terenska opažanja identificiraju četiri ključna domene prednosti:

| Evolucijska Domena | Mehanizam Djelovanja | Biološki Primjer |
| :---- | :---- | :---- |
| **Obrana od predatora** | **Efekt razrjeđivanja:** Smanjena vjerojatnost da bilo koja jedinka bude ulovljena. **Efekt zbunjivanja:** Brzo kretanje mnoštva meta preopterećuje senzorni sustav predatora. **Kolektivna vigilancija:** "Mnoštvo očiju" omogućuje bržu detekciju prijetnji. | Jata srdela (škole riba), čvorci (*Sturnus vulgaris*), krda zebri.9 |
| **Efikasnost hranjenja** | **Distribuirano pretraživanje:** Brže lociranje stohastički raspoređenih resursa. **Kooperativni lov:** Strategije opkoljavanja koje pojedinac ne može izvesti. | Mravi, vukovi, orke, afrički divlji psi.15 |
| **Aerodinamička/Hidrodinamička ušteda** | Korištenje vrtloga koje stvara jedinka ispred za smanjenje otpora. Ribe u školi mogu smanjiti potrošnju kisika, a ptice u V-formaciji povećati domet leta do 70%. | Migratorne ptice, ribe, biciklistički peletoni (analogija).9 |
| **Reprodukcija i termoregulacija** | Agregacija povećava šansu pronalaska partnera i omogućuje održavanje topline u ekstremnim uvjetima. | Carski pingvini (huddling), mrijest koralja.9 |

Zanimljiv aspekt evolucijske dinamike je uloga **konflikta**. Istraživanja pokazuju da heterogenost ciljeva unutar grupe može poboljšati točnost odlučivanja. Ako pojedinci imaju blago različite prioritete (npr. neki preferiraju sigurnost, drugi hranu), grupa kao cjelina manje je podložna katastrofalnim pogreškama ("grupnom mišljenju") nego homogena grupa. Konflikt sprječava prebrzu konvergenciju na suboptimalno rješenje.16

## ---

**3\. Računalna inteligencija roja: Od biologije do algoritama**

Translacija bioloških principa u računalne algoritme stvorila je granu umjetne inteligencije poznatu kao SI (*Swarm Intelligence*). Ovi meta-heuristički algoritmi ne jamče pronalazak apsolutnog globalnog optimuma, ali su iznimno efikasni u pronalaženju "dovoljno dobrih" rješenja u problemima koji su prekompleksni za egzaktne metode (NP-teški problemi).4

### **3.1. Optimizacija rojem čestica (PSO \- Particle Swarm Optimization)**

Algoritam PSO, koji su 1995\. razvili socijalni psiholog James Kennedy i inženjer Russell Eberhart, izvorno je bio simulacija socijalnog ponašanja ptičjih jata. U PSO-u, rješenja problema predstavljena su kao "čestice" koje lete kroz hiper-prostor pretraživanja.4

Svaka čestica ima poziciju (kandidat za rješenje) i brzinu. U svakoj iteraciji, čestica ažurira svoju brzinu temeljem tri komponente:

1. **Inercijska komponenta ($w$):** Tendencija čestice da nastavi kretanje u istom smjeru. Ovo simulira moment i omogućuje pretraživanje novih područja.  
2. **Kognitivna komponenta ($c\_1$, $p\_{best}$):** Sjećanje čestice na najbolju poziciju koju je *osobno* pronašla. Ovo predstavlja individualno učenje.  
3. **Socijalna komponenta ($c\_2$, $g\_{best}$):** Privlačnost prema najboljoj poziciji koju je pronašao *bilo tko u susjedstvu* (ili cijelom roju). Ovo predstavlja kulturalnu transmisiju znanja.4

Matematička formula za ažuriranje brzine ($v$) glasi:

$$v\_{i}(t+1) \= w \\cdot v\_{i}(t) \+ c\_{1}r\_{1}(p\_{best} \- x\_{i}(t)) \+ c\_{2}r\_{2}(g\_{best} \- x\_{i}(t))$$  
Gdje su $r\_1$ i $r\_2$ nasumični brojevi koji unose stohastičnost, sprječavajući determinističko zaglavljivanje u lokalnim optimumima. PSO se pokazao iznimno uspješnim u treniranju neuronskih mreža (podešavanje težina), optimizaciji elektroenergetskih sustava i kontroli reaktivne snage.19

### **3.2. Optimizacija kolonijom mrava (ACO \- Ant Colony Optimization)**

ACO algoritmi, pionirski rad Marca Doriga, modeliraju feromonsku komunikaciju mrava. Primjenjuju se primarno na diskretne optimizacijske probleme, kao što je problem trgovačkog putnika (TSP) ili rutiranje paketa u internetu.4

U ACO-u, "umjetni mravi" grade rješenja krećući se po grafu. Vjerojatnost odabira određenog puta ovisi o količini "virtualnog feromona" na tom bridu i heurističkoj informaciji (npr. udaljenosti do sljedećeg grada).  
Ključni aspekt ACO-a je isparavanje feromona. Nakon svake iteracije, feromon na svim bridovima se smanjuje. Ovo je ključno za zaboravljanje loših rješenja. Da nema isparavanja, feromon bi se akumulirao svugdje, ili bi prva (vjerojatno suboptimalna) staza postala toliko dominantna da bi svi mravi konvergirali na nju, onemogućujući daljnje pretraživanje.20 Varijante poput Max-Min Ant System uvode gornje i donje granice feromona kako bi se dodatno potaknula eksploracija.20

### **3.3. Algoritam umjetne pčelinje kolonije (ABC \- Artificial Bee Colony)**

ABC algoritam, koji je predložio Karaboga, specifično je dizajniran za numeričku optimizaciju. On dijeli populaciju agenata na tri funkcionalne grupe, zrcalići strukturu prave košnice 21:

1. **Zaposlene pčele (Employed Bees):** Vezane su za specifičan izvor hrane (rješenje). One "plešu" (dijele informacije) o kvaliteti svog rješenja.  
2. **Pčele promatrači (Onlooker Bees):** Promatraju plesove i biraju izvore hrane probabilistički, preferirajući one s većim "fitnessom" (kvalitetom nektara). One zatim pretražuju okolinu odabranog rješenja.  
3. **Pčele izviđači (Scout Bees):** Ako se rješenje ne može poboljšati nakon određenog broja pokušaja (parametar "limit"), zaposlena pčela napušta taj izvor i postaje izviđač, nasumično birajući novu lokaciju u prostoru pretraživanja.

Mehanizam "izviđača" djeluje kao snažan operator globalnog pretraživanja, sprječavajući algoritam da zapne u lokalnim optimumima, dok promatrači vrše finu lokalnu pretragu (eksploataciju).21

### **3.4. Komparativna analiza i ljudski rojevi**

Osim klasičnih algoritama, polje se širi na nove metafore poput algoritma sivog vuka (GWO \- oponaša hijerarhiju i opkoljavanje) i algoritma krijesnice (privlačenje svjetlom).24 Međutim, kritičari upozoravaju na inflaciju novih algoritama koji su matematički vrlo slični postojećima, skriveni iza novih bioloških metafora.

Zanimljiva ekstenzija SI-a je primjena na ljude – **Human Swarming**. Platforme poput UNU-a (Unanimous AI) povezuju grupe ljudi u stvarnom vremenu, omogućujući im da kolektivno donose odluke pomicanjem "paka" na ekranu. Studije su pokazale da takvi "ljudski rojevi" postižu značajno bolje rezultate u predviđanju (npr. dobitnika Oscara ili sportskih rezultata) nego pojedinačni stručnjaci ili tradicionalne ankete (konsenzus/glasovanje), potvrđujući da se principi biološke sinkronizacije mogu primijeniti za pojačavanje ljudske kognicije.11

## ---

**4\. Robotika roja: Inženjering decentralizirane autonomije**

Robotika roja (*Swarm Robotics*) predstavlja fizičku manifestaciju SI principa. To je pomak od proizvodnje skupih, visoko-sofisticiranih pojedinačnih robota prema masovnoj proizvodnji jednostavnih, jeftinih jedinica koje su individualno potrošne, ali kolektivno moćne.

### **4.1. Arhitekturni zahtjevi i definicija**

Prema Sahinu i Beniju, robotski roj karakteriziraju:

* **Autonomija:** Roboti su fizički utjelovljeni i donose odluke samostalno.  
* **Decentralizacija:** Nema "mozga" izvan roja koji šalje komande.  
* **Lokalna percepcija i komunikacija:** Roboti ne vide cijeli svijet; vide samo susjede i neposrednu okolinu.2

Ovakva arhitektura osigurava tri ključna svojstva:

1. **Robusnost:** Kvar pojedinog robota ne utječe na misiju.  
2. **Skalabilnost:** Dodavanje novih robota ne zahtijeva rekonfiguraciju softvera.  
3. **Fleksibilnost:** Isti roj može obavljati različite zadatke u različitim okruženjima.5

### **4.2. Studija slučaja: Kilobots i programibilna materija**

Jedan od najznačajnijih eksperimentalnih platformi je **Kilobot**, razvijen na Sveučilištu Harvard. Kilobot je dizajniran da bude jeftin (cca 14 USD) kako bi se omogućili eksperimenti s tisućama jedinica.28

* **Pogon:** Umjesto kotača, koriste dva vibracijska motora (poput onih u mobitelima). Različite frekvencije vibracija omogućuju kretanje naprijed ili rotaciju (slip-stick motion).  
* **Komunikacija:** Koriste infracrveno (IR) svjetlo odbijeno od podloge. To omogućuje komunikaciju samo s robotima u neposrednoj blizini (do 10 cm).  
* **Samo-sastavljanje:** Kiloboti su demonstrirali sposobnost autonomnog formiranja složenih 2D oblika (zvijezda, slovo K). Algoritam se temelji na gradijentu: "sjemeni" roboti odašilju signal "udaljenosti 0", a ostali računaju svoju udaljenost (hop count) i kreću se uz rub roja dok ne nađu svoje mjesto prema nacrtu. Ovaj proces je spor i podložan greškama, ali dokazuje koncept **programibilne materije** – materijala koji može mijenjati oblik na zapovijed.29

### **4.3. Senzorika i biomimetika: Umjetna bočna linija**

Za podvodne rojeve, vizualna komunikacija je često nemoguća zbog mutne vode, a radio valovi (RF) se ne šire dobro. Inženjeri se stoga okreću biomimetici, kopirajući **bočnu liniju** (lateral line) riba. Ribe koriste nizove dlačica (neuromasta) za detekciju promjena tlaka i brzine vode, što im omogućuje "slikanje" okoline u potpunom mraku.

Istraživači koriste MEMS tehnologiju (*Micro-Electro-Mechanical Systems*) za izradu umjetnih dlačica i senzora tlaka. Ovi senzori omogućuju podvodnim robotima da osjete vrtloge koje stvaraju drugi roboti ili prepreke. Primjenom algoritama poput *Capon beamforming*, roj može lokalizirati izvore vibracija (npr. drugog robota ili "plijen") i održavati formaciju štedeći energiju plivanjem u hidrodinamičkoj zavjetrini vođe, baš kao prave ribe.32

### **4.4. Komunikacija: Eksplicitna vs. Implicitna (Stigmergija)**

Dizajn komunikacije je kritičan inženjerski izbor.

* **Eksplicitna komunikacija (Direct RF/Wi-Fi):** Omogućuje brz prijenos velikih količina podataka, ali pati od problema skalabilnosti. Kako broj robota raste, dolazi do zagušenja kanala i kolizije paketa podataka.35  
* **Stigmergijska komunikacija (Implicit):** Roboti komuniciraju ostavljajući "tragove" u okolini. U virtualnoj stigmergiji, robot može "tagirati" GPS lokaciju s podacima koje drugi roboti očitaju kada dođu na tu lokaciju (npr. RFID tagovi). Ovo potpuno eliminira potrebu za sinkronizacijom i otporno je na prekid veza. Istraživanja pokazuju da rojevi mogu automatski prelaziti s direktne na stigmergijsku komunikaciju ovisno o uvjetima u okolišu.35

## ---

**5\. Medicinska nanorobotika: Roj u mikrosvijetu**

Jedna od najrevolucionarnijih primjena principa roja nalazi se u medicini, gdje se razvijaju nanoroboti za borbu protiv bolesti na staničnoj razini. U ovom mjerilu (nanometri do mikrometri), fizikalni zakoni se mijenjaju: inercijske sile postaju zanemarive, a viskoznost i Brownovo gibanje dominiraju (nizak Reynoldsov broj). Plivanje u krvi za nanorobota je poput plivanja čovjeka u medu.

### **5.1. Pogon i navigacija**

Konvencionalni motori nisu iskoristivi. Nanoroboti koriste inovativne metode pogona:

* **Magnetska propulzija:** Vanjska magnetska polja rotiraju helikoidne (spiralne) nanorobote, tjerajući ih naprijed poput vijka. Ovo omogućuje precizno vođenje izvan tijela.38  
* **Kemijski motori:** Neki nanoroboti koriste katalitičke reakcije (npr. razgradnju glukoze ili ureje) za stvaranje mlaza mjehurića ili promjenu lokalnih kemijskih gradijenata (difuzioforeza) za kretanje.40  
* **Bio-hibridni sustavi:** Korištenje živih stanica, poput spermija ili bakterija, kao "motora" za transport sintetičkog tereta (lijeka). Ovi hibridi nasljeđuju sposobnost kemotaksije (kretanje prema kemijskom izvoru) od biološkog domaćina.41

### **5.2. Terapija raka i dostava lijekova**

Tradicionalna kemoterapija je sistemska – otrov se širi cijelim tijelom, ubijajući i zdrave stanice. Roj nanorobota nudi **ciljanu terapiju**.

* **Probijanje barijera:** Tumori imaju povišen intersticijski tlak i guste membrane koje otežavaju prodor lijekova. Nanoroboti pogonjeni magnetskim poljem mogu fizički probiti te barijere. Nedavna istraživanja (2025.) pokazuju uspjeh s "šiljatim" nanorobotima koji djeluju kao mikroskopski skalpeli, mehanički oštećujući membranu stanica raka kako bi olakšali ulazak lijeka, rješavajući problem otpornosti na lijekove.39  
* **Krvno-moždana barijera (BBB):** BBB je neprobojna za većinu lijekova, što otežava liječenje tumora mozga (glioblastoma). Rojevi magnetskih nanorobota, ili dendrimerni nanokompleksi, pokazali su sposobnost aktivnog prelaska ove barijere i isporuke tereta direktno u mozak.38  
* **Teranostika:** Nanoroboti mogu služiti istovremeno za terapiju i dijagnostiku (imaging), koristeći magnetske čestice kao kontrast za MRI dok dostavljaju lijek.42

## ---

**6\. Makroskopske primjene: Od bojnog polja do oranica**

Izlazak iz laboratorija u stvarni svijet donosi primjenu rojeva u vojsci, poljoprivredi i spašavanju.

### **6.1. Vojni rojevi i asimetrično ratovanje**

Vojna doktrina ubrzano usvaja tehnologiju rojeva (drone swarms). Za razliku od današnjih dronova (poput Reapera) kojima upravlja pilot, roj djeluje autonomno.

* **Saturacija i asimetrija troškova:** Roj od 100 jeftinih dronova može napasti nosač aviona ili protuzračnu bateriju. Čak i ako obrana obori 90% roja, preostalih 10% može uništiti cilj. Ekonomija je na strani roja: jedan presretač (projektil) košta milijune dolara, dok dron košta par tisuća.44  
* **Kill Chain automatizacija:** Rojevi provode ISTAR misije (Intelligence, Surveillance, Target Acquisition, Reconnaissance), automatski identificiraju mete i dijele podatke u realnom vremenu, drastično skraćujući vrijeme od detekcije do napada.44  
* **Morfologija i Stealth:** Rojevi mogu mijenjati oblik leta kako bi oponašali biološke uzorke ili smanjili radarski odraz, a gubitak komunikacije s bazom ne zaustavlja misiju zbog distribuirane inteligencije.47

### **6.2. Precizna poljoprivreda (SAGA)**

Projekt SAGA (Swarm Robotics for Agricultural Applications) ilustrira civilnu primjenu. Umjesto tretiranja cijelog polja pesticidima, roj malih dronova mapira polje u visokoj rezoluciji. Koristeći računalni vid, prepoznaju korov i bolesti.  
Dronovi se ponašaju poput pčela: kada jedan pronađe "zakrpu" korova, privlači druge (ili zemaljske robote) na tu lokaciju radi preciznog prskanja ili mehaničkog uklanjanja. Ovo drastično smanjuje upotrebu kemikalija, troškove i utjecaj na okoliš, omogućujući nadzor na razini pojedine biljke na ogromnim površinama.48

### **6.3. Potraga i spašavanje (Disaster Relief)**

U scenarijima katastrofa (potresi, poplave), vrijeme je ključno. Heterogeni rojevi (zračni \+ zemaljski \+ vodeni roboti) mogu pretraživati ruševine.

* **Distribuirani SLAM:** Roj može ući u zgradu bez GPS signala i kolaborativno izgraditi 3D mapu prostora (Simultaneous Localization and Mapping). Ako jedan robot ostane zarobljen, njegovi podaci su već podijeljeni s rojem.50  
* **Zmijoliki roboti:** Inspirirani biologijom, ovi roboti ulaze u uske pukotine ruševina, koristeći senzore za detekciju topline tijela ili CO2. Algoritmi roja omogućuju im da koordiniraju pretraživanje kako ne bi pretraživali isto mjesto dvaput.51

## ---

**7\. Etički izazovi, sigurnost i ograničenja**

Implementacija rojeva donosi rizike koji su kvalitativno drugačiji od rizika pojedinačnih strojeva.

### **7.1. Tehnička ograničenja**

* **Predvidljivost:** Emergentno ponašanje je po definiciji teško predvidjeti. U kaotičnom okruženju, roj bi mogao razviti ponašanje koje inženjeri nisu programirali (npr. oscilacije ili agresivno grupiranje), što je neprihvatljivo u blizini ljudi.53  
* **Komunikacijska uska grla:** Iako je decentralizacija cilj, u praksi je potrebna određena razina globalne koordinacije, što stvara pritisak na propusnost mreže (bandwidth).36

### **7.2. Sigurnost i Hacking**

Roj je siguran od fizičkog uništenja, ali ranjiv na cyber-napade.

* **Preuzimanje (Hijacking):** Ako napadač preuzme kontrolu nad samo nekoliko agenata u roju i natjera ih da se ponašaju suprotno ciljevima (npr. šalju lažne signale o preprekama), to se može proširiti kroz roj poput virusa, uzrokujući kolaps sustava ili ga okrećući protiv vlasnika.55

### **7.3. Etička dimenzija autonomnog oružja**

Najveća kontroverza vezana je uz **LAWS** (*Lethal Autonomous Weapons Systems*).

* **Odgovornost (Accountability Gap):** Tko je kriv ako autonomni roj počini ratni zločin? Zapovjednik koji ga je aktivirao, programer koji je napisao kod, ili sam algoritam? Trenutni pravni okviri ne nude jasan odgovor.55  
* **Digitalna dehumanizacija:** Algoritmi svode ljudska bića na uzorke podataka (pattern matching). Prepuštanje odluke o životu i smrti stroju, bez "značajne ljudske kontrole" (*Meaningful Human Control*), smatra se moralno neprihvatljivim i kršenjem ljudskog dostojanstva. Međunarodne inicijative, poput "Stop Killer Robots", aktivno zagovaraju preventivnu zabranu takvih sustava.58

## ---

**8\. Zaključak**

Fenomen roja predstavlja jednu od najdubljih lekcija koje priroda nudi tehnologiji: inteligencija nije nužno svojstvo pojedinca, već emergentno svojstvo interakcija. Od mikroskopskih plesova nanorobota koji ciljaju tumore do makroskopskih formacija dronova koji nadziru usjeve, dinamika roja redefinira granice mogućeg.

Prijelaz s centraliziranih na decentralizirane sustave donosi neviđenu robusnost i skalabilnost, ali po cijenu predvidljivosti i kontrole. Budućnost ovog polja neće biti samo u boljim algoritmima, već u razvoju novih etičkih i pravnih okvira koji će moći pratiti autonomiju koju stvaramo. Simbioza bioloških uvida i inženjerske preciznosti sugerira budućnost u kojoj se granica između prirodnog i umjetnog roja briše, stvarajući hibridne sustave sposobne za rješavanje najsloženijih izazova čovječanstva.

### ---

**Korišteni izvori (sažetak po ID-ovima)**

* **Teorija i Biologija:** 1  
* **Algoritmi (SI):** 4  
* **Robotika i Hardver:** 5  
* **Primjene (Medicina, Vojska, Ostalo):** 38  
* **Etika i Rizici:** 53

#### **Works cited**

1. The Science of Swarms: How Insects, Birds, and Robots Cooperate in Large Groups | by Ayesha siddiqa | Medium, accessed January 4, 2026, [https://medium.com/@ayesha.siddiqa2197/the-science-of-swarms-how-insects-birds-and-robots-cooperate-in-large-groups-df4b404d7b68](https://medium.com/@ayesha.siddiqa2197/the-science-of-swarms-how-insects-birds-and-robots-cooperate-in-large-groups-df4b404d7b68)  
2. From animal collective behaviors to swarm robotic cooperation \- PMC \- PubMed Central, accessed January 4, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10089591/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10089591/)  
3. The biological principles of swarm intelligence \- Harvard University, accessed January 4, 2026, [https://klab.tch.harvard.edu/academia/classes/BAI/pdfs/Garnier2007.pdf](https://klab.tch.harvard.edu/academia/classes/BAI/pdfs/Garnier2007.pdf)  
4. Particle Swarm Optimization (PSO) \- Martin Pilát, accessed January 4, 2026, [https://martinpilat.com/en/nature-inspired-algorithms/swarms-colonies/](https://martinpilat.com/en/nature-inspired-algorithms/swarms-colonies/)  
5. Swarm robotics \- Wikipedia, accessed January 4, 2026, [https://en.wikipedia.org/wiki/Swarm\_robotics](https://en.wikipedia.org/wiki/Swarm_robotics)  
6. Swarm intelligence \- Scholarpedia, accessed January 4, 2026, [http://www.scholarpedia.org/article/Swarm\_intelligence](http://www.scholarpedia.org/article/Swarm_intelligence)  
7. Swarm Robotics: How Collective Intelligence Will Transform Space Exploration, accessed January 4, 2026, [https://universemagazine.com/en/swarm-robotics-how-collective-intelligence-will-transform-space-exploration/](https://universemagazine.com/en/swarm-robotics-how-collective-intelligence-will-transform-space-exploration/)  
8. Stigmergy \- Wikipedia, accessed January 4, 2026, [https://en.wikipedia.org/wiki/Stigmergy](https://en.wikipedia.org/wiki/Stigmergy)  
9. Swarm behaviour \- Wikipedia, accessed January 4, 2026, [https://en.wikipedia.org/wiki/Swarm\_behaviour](https://en.wikipedia.org/wiki/Swarm_behaviour)  
10. Stigmergy | Swarm Intelligence and Robotics Class Notes \- Fiveable, accessed January 4, 2026, [https://fiveable.me/swarm-intelligence-and-robotics/unit-6/stigmergy/study-guide/L6j1cyesyCpC1JCs](https://fiveable.me/swarm-intelligence-and-robotics/unit-6/stigmergy/study-guide/L6j1cyesyCpC1JCs)  
11. Artificial Swarm Intelligence vs Human Experts \- Unanimous AI, accessed January 4, 2026, [http://unanimous.ai/wp-content/uploads/2016/09/Artificial-Swarm-Intelligence-vs-Human-Experts-IJCNN.pdf](http://unanimous.ai/wp-content/uploads/2016/09/Artificial-Swarm-Intelligence-vs-Human-Experts-IJCNN.pdf)  
12. \[PDF\] Artificial Swarm Intelligence vs human experts \- Semantic Scholar, accessed January 4, 2026, [https://www.semanticscholar.org/paper/Artificial-Swarm-Intelligence-vs-human-experts-Rosenberg/ffaace192674456f2a574af80d284b96b3a26ded](https://www.semanticscholar.org/paper/Artificial-Swarm-Intelligence-vs-human-experts-Rosenberg/ffaace192674456f2a574af80d284b96b3a26ded)  
13. (PDF) Artificial Swarm Intelligence vs human experts \- ResearchGate, accessed January 4, 2026, [https://www.researchgate.net/publication/309779023\_Artificial\_Swarm\_Intelligence\_vs\_human\_experts](https://www.researchgate.net/publication/309779023_Artificial_Swarm_Intelligence_vs_human_experts)  
14. Predator confusion is sufficient to evolve swarming behaviour \- PMC \- NIH, accessed January 4, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC4043163/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4043163/)  
15. Reprinted from Theoretical Population BIOLOGY All Rights Reserved by Academic Press, New York and London \- The Evolutionary Advantages of Group Foraging, accessed January 4, 2026, [https://people.ucsc.edu/\~msmangel/TPB1986.pdf](https://people.ucsc.edu/~msmangel/TPB1986.pdf)  
16. Swarm Intelligence: Squabbling Meerkats Make Better Decisions \- Berlin, accessed January 4, 2026, [https://www.mpib-berlin.mpg.de/press-releases/warm-intelligence-in-biology](https://www.mpib-berlin.mpg.de/press-releases/warm-intelligence-in-biology)  
17. Recent Developments in the Theory and Applicability of Swarm Search \- DSpace@MIT, accessed January 4, 2026, [https://dspace.mit.edu/bitstream/handle/1721.1/150609/entropy-25-00710.pdf?sequence=1\&isAllowed=y](https://dspace.mit.edu/bitstream/handle/1721.1/150609/entropy-25-00710.pdf?sequence=1&isAllowed=y)  
18. Particle Swarm Optimization (PSO) \- An Overview \- GeeksforGeeks, accessed January 4, 2026, [https://www.geeksforgeeks.org/machine-learning/particle-swarm-optimization-pso-an-overview/](https://www.geeksforgeeks.org/machine-learning/particle-swarm-optimization-pso-an-overview/)  
19. Comparative Analysis of Ant Colony and Particle Swarm Optimization Techniques \- International Journal of Computer Applications, accessed January 4, 2026, [https://www.ijcaonline.org/volume5/number4/pxc3871286.pdf](https://www.ijcaonline.org/volume5/number4/pxc3871286.pdf)  
20. Ant colony optimization algorithms \- Wikipedia, accessed January 4, 2026, [https://en.wikipedia.org/wiki/Ant\_colony\_optimization\_algorithms](https://en.wikipedia.org/wiki/Ant_colony_optimization_algorithms)  
21. Artificial bee colony algorithm \- Scholarpedia, accessed January 4, 2026, [http://www.scholarpedia.org/article/Artificial\_bee\_colony\_algorithm](http://www.scholarpedia.org/article/Artificial_bee_colony_algorithm)  
22. Adaptive Exploration Artificial Bee Colony for Mathematical Optimization \- MDPI, accessed January 4, 2026, [https://www.mdpi.com/2673-2688/5/4/109](https://www.mdpi.com/2673-2688/5/4/109)  
23. Artificial Bee Colony Optimization Algorithm STEP-BY-STEP with Numerical Example \~xRay Pixy \- YouTube, accessed January 4, 2026, [https://www.youtube.com/watch?v=SVXmJdLsN0M](https://www.youtube.com/watch?v=SVXmJdLsN0M)  
24. (PDF) Using Improved Hybrid Grey Wolf Algorithm Based on Artificial Bee Colony Algorithm Onlooker and Scout Bee Operators for Solving Optimization Problems \- ResearchGate, accessed January 4, 2026, [https://www.researchgate.net/publication/380391102\_Using\_Improved\_Hybrid\_Grey\_Wolf\_Algorithm\_Based\_on\_Artificial\_Bee\_Colony\_Algorithm\_Onlooker\_and\_Scout\_Bee\_Operators\_for\_Solving\_Optimization\_Problems](https://www.researchgate.net/publication/380391102_Using_Improved_Hybrid_Grey_Wolf_Algorithm_Based_on_Artificial_Bee_Colony_Algorithm_Onlooker_and_Scout_Bee_Operators_for_Solving_Optimization_Problems)  
25. Grey Wolf Optimizer \- How it can be used with Computer Vision \- Towards Data Science, accessed January 4, 2026, [https://towardsdatascience.com/grey-wolf-optimizer-how-it-can-be-used-with-computer-vision-234d051a52ae/](https://towardsdatascience.com/grey-wolf-optimizer-how-it-can-be-used-with-computer-vision-234d051a52ae/)  
26. A Effective Decision Making Approach “Human Swarming with Artificial Swarm Intelligence”, accessed January 4, 2026, [https://ijarcs.info/index.php/Ijarcs/article/view/4157/3792](https://ijarcs.info/index.php/Ijarcs/article/view/4157/3792)  
27. Stigmergic interaction in robotic multi-agent systems using virtual pheromones \- DiVA portal, accessed January 4, 2026, [http://www.diva-portal.org/smash/get/diva2:1887312/FULLTEXT01.pdf](http://www.diva-portal.org/smash/get/diva2:1887312/FULLTEXT01.pdf)  
28. Kilobot: A low cost robot with scalable operations designed for collective behaviors, accessed January 4, 2026, [https://users.eecs.northwestern.edu/\~mrubenst/RAS2013.pdf](https://users.eecs.northwestern.edu/~mrubenst/RAS2013.pdf)  
29. Self-Disassembly for Shape Formation Using Kilobots, accessed January 4, 2026, [https://kilobot.wcu.edu/wp-content/uploads/2018/07/WCU\_Capstone\_symposium\_2018.pdf](https://kilobot.wcu.edu/wp-content/uploads/2018/07/WCU_Capstone_symposium_2018.pdf)  
30. Programmable Self-assembly in a Thousand-Robot Swarm | NAGPAL LAB, accessed January 4, 2026, [https://ssr.princeton.edu/publications/programmable-self-assembly-thousand-robot-swarm](https://ssr.princeton.edu/publications/programmable-self-assembly-thousand-robot-swarm)  
31. Self-assembly of thousand little robots "Kilobots" to form complex shapes. \- YouTube, accessed January 4, 2026, [https://www.youtube.com/watch?v=-Q14d-c65CY](https://www.youtube.com/watch?v=-Q14d-c65CY)  
32. Biomimetic flow imaging with an artificial fish lateral line \- Illinois Experts, accessed January 4, 2026, [https://experts.illinois.edu/en/publications/biomimetic-flow-imaging-with-an-artificial-fish-lateral-line](https://experts.illinois.edu/en/publications/biomimetic-flow-imaging-with-an-artificial-fish-lateral-line)  
33. BIOMIMETIC FLOW IMAGING WITH AN ARTIFICIAL FISH LATERAL LINE \- SciTePress, accessed January 4, 2026, [https://www.scitepress.org/papers/2008/10630/10630.pdf](https://www.scitepress.org/papers/2008/10630/10630.pdf)  
34. Biomimetic Flow Sensors \- SciSpace, accessed January 4, 2026, [https://scispace.com/pdf/biomimetic-flow-sensors-44l8wspm9o.pdf](https://scispace.com/pdf/biomimetic-flow-sensors-44l8wspm9o.pdf)  
35. Direct Communication or Stigmergy? Selecting Communication Mechanisms for Robot Swarms via Automatic Modular Design, accessed January 4, 2026, [https://direct.mit.edu/isal/proceedings-pdf/isal2025/37/87/2567187/isal.a.915.pdf](https://direct.mit.edu/isal/proceedings-pdf/isal2025/37/87/2567187/isal.a.915.pdf)  
36. A Comprehensive Review of Bio-Inspired Approaches to Coordination, Communication, and System Architecture in Underwater Swarm Robotics \- MDPI, accessed January 4, 2026, [https://www.mdpi.com/2077-1312/14/1/59](https://www.mdpi.com/2077-1312/14/1/59)  
37. Recent Advances in Swarm Robotics Coordination: Communication and Memory Challenges \- MDPI, accessed January 4, 2026, [https://www.mdpi.com/2076-3417/12/21/11116](https://www.mdpi.com/2076-3417/12/21/11116)  
38. Therapeutic applications of nanobots and nanocarriers in cancer treatment \- PMC, accessed January 4, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC12307532/](https://pmc.ncbi.nlm.nih.gov/articles/PMC12307532/)  
39. Magnetically-powered nanorobots enhance drug uptake in tumors \- News-Medical.Net, accessed January 4, 2026, [https://www.news-medical.net/news/20250922/Magnetically-powered-nanorobots-enhance-drug-uptake-in-tumors.aspx](https://www.news-medical.net/news/20250922/Magnetically-powered-nanorobots-enhance-drug-uptake-in-tumors.aspx)  
40. Nano bio-robots: a new frontier in targeted therapeutic delivery, accessed January 4, 2026, [https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2025.1639445/full](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2025.1639445/full)  
41. Translational nanorobotics breaking through biological membranes \- Chemical Society Reviews (RSC Publishing) DOI:10.1039/D4CS00483C, accessed January 4, 2026, [https://pubs.rsc.org/en/content/articlehtml/2025/cs/d4cs00483c](https://pubs.rsc.org/en/content/articlehtml/2025/cs/d4cs00483c)  
42. Advancements in Micro/Nanorobots in Medicine: Design, Actuation, and Transformative Application \- PMC \- PubMed Central, accessed January 4, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC11840590/](https://pmc.ncbi.nlm.nih.gov/articles/PMC11840590/)  
43. \[2411.02345\] Simulation of Nanorobots with Artificial Intelligence and Reinforcement Learning for Advanced Cancer Cell Detection and Tracking \- arXiv, accessed January 4, 2026, [https://arxiv.org/abs/2411.02345](https://arxiv.org/abs/2411.02345)  
44. Drone warfare \- Wikipedia, accessed January 4, 2026, [https://en.wikipedia.org/wiki/Drone\_warfare](https://en.wikipedia.org/wiki/Drone_warfare)  
45. GAO-23-106930, SCIENCE & TECH SPOTLIGHT: DRONE SWARM TECHNOLOGIES, accessed January 4, 2026, [https://www.gao.gov/assets/gao-23-106930.pdf](https://www.gao.gov/assets/gao-23-106930.pdf)  
46. U.S. Army To Explore ISR Drone Swarms This Year | AFCEA International, accessed January 4, 2026, [https://www.afcea.org/signal-media/intelligence/us-army-explore-isr-drone-swarms-year](https://www.afcea.org/signal-media/intelligence/us-army-explore-isr-drone-swarms-year)  
47. Bioinspired Morphing in Aerodynamics and Hydrodynamics: Engineering Innovations for Aerospace and Renewable Energy \- MDPI, accessed January 4, 2026, [https://www.mdpi.com/2313-7673/10/7/427](https://www.mdpi.com/2313-7673/10/7/427)  
48. accessed January 4, 2026, [https://www.automate.org/news/the-future-of-swarm-robotics-applications-and-challenges-123\#:\~:text=The%20use%20of%20swarm%20robotics,commander%20can%20efficiently%20coverlarge%20fields.](https://www.automate.org/news/the-future-of-swarm-robotics-applications-and-challenges-123#:~:text=The%20use%20of%20swarm%20robotics,commander%20can%20efficiently%20coverlarge%20fields.)  
49. Will precision agriculture bring you food grown by a swarm of robots? \- CORDIS, accessed January 4, 2026, [https://cordis.europa.eu/article/id/129935-will-precision-agriculture-bring-you-food-grown-by-a-swarm-of-robots/de](https://cordis.europa.eu/article/id/129935-will-precision-agriculture-bring-you-food-grown-by-a-swarm-of-robots/de)  
50. Swarm SLAM: Challenges and Perspectives \- Frontiers, accessed January 4, 2026, [https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2021.618268/full](https://www.frontiersin.org/journals/robotics-and-ai/articles/10.3389/frobt.2021.618268/full)  
51. Humanoid Robots in Disaster Response and Search and Rescue Operations, accessed January 4, 2026, [https://blog.robozaps.com/b/humanoid-robots-in-disaster-response](https://blog.robozaps.com/b/humanoid-robots-in-disaster-response)  
52. Robotics in Search and Rescue (SAR) Operations: An Ethical and Design Perspective Framework for Response Phase \- MDPI, accessed January 4, 2026, [https://www.mdpi.com/2076-3417/13/3/1800](https://www.mdpi.com/2076-3417/13/3/1800)  
53. What are the limitations of swarm intelligence? \- Milvus, accessed January 4, 2026, [https://milvus.io/ai-quick-reference/what-are-the-limitations-of-swarm-intelligence](https://milvus.io/ai-quick-reference/what-are-the-limitations-of-swarm-intelligence)  
54. The road forward with swarm systems | Philosophical Transactions of the Royal Society A, accessed January 4, 2026, [https://royalsocietypublishing.org/rsta/article/383/2289/20240135/112745/The-road-forward-with-swarm-systemsThe-road](https://royalsocietypublishing.org/rsta/article/383/2289/20240135/112745/The-road-forward-with-swarm-systemsThe-road)  
55. The Ethics of Robots in War \- Army University Press, accessed January 4, 2026, [https://www.armyupress.army.mil/Journals/NCO-Journal/Archives/2024/February/The-Ethics-of-Robots-in-War/](https://www.armyupress.army.mil/Journals/NCO-Journal/Archives/2024/February/The-Ethics-of-Robots-in-War/)  
56. Can Autonomous Weapon Systems be Seized? Interactions with the Law of Prize and War Booty \- Oxford Academic, accessed January 4, 2026, [https://academic.oup.com/jcsl/article/29/1/143/7512115](https://academic.oup.com/jcsl/article/29/1/143/7512115)  
57. Full article: The ethical legitimacy of autonomous Weapons systems: reconfiguring war accountability in the age of artificial Intelligence \- Taylor & Francis Online, accessed January 4, 2026, [https://www.tandfonline.com/doi/full/10.1080/16544951.2025.2540131](https://www.tandfonline.com/doi/full/10.1080/16544951.2025.2540131)  
58. Problems with autonomous weapons \- Stop Killer Robots, accessed January 4, 2026, [https://www.stopkillerrobots.org/stop-killer-robots/facts-about-autonomous-weapons/](https://www.stopkillerrobots.org/stop-killer-robots/facts-about-autonomous-weapons/)  
59. Self-Organized Fish Schools: An Examination of Emergent Properties | The Biological Bulletin: Vol 202, No 3 \- The University of Chicago Press: Journals, accessed January 4, 2026, [https://www.journals.uchicago.edu/doi/10.2307/1543482](https://www.journals.uchicago.edu/doi/10.2307/1543482)  
60. Ant colony optimization algorithm \- YouTube, accessed January 4, 2026, [https://www.youtube.com/watch?v=u7bQomllcJw](https://www.youtube.com/watch?v=u7bQomllcJw)  
61. Advances of medical nanorobots for future cancer treatments \- PMC \- PubMed Central, accessed January 4, 2026, [https://pmc.ncbi.nlm.nih.gov/articles/PMC10347767/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10347767/)