// 인물별 '원본 사진 모음' — Commons 자동 스캔(scripts/gallery-scan.ts) + 카테고리 수집. 후보는 검수 '채택' 전까지 비공개.
// srcColor: 채택 후 같은 톤 컬러 복원본(scripts/gallery-colorize.ts).
export type GalleryPhoto = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };

export const GALLERY: Record<string, GalleryPhoto[]> = {
  "underwood": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Horace_Grant_Underwood.jpg",
      "caption": "Horace Grant Underwood",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood.jpg",
      "srcColor": "/portraits/gallery/underwood-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Horace_Grant_Underwood_in_1916.jpg",
      "caption": "Horace Grant Underwood in 1916",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood_in_1916.jpg",
      "srcColor": "/portraits/gallery/underwood-1-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/29/Horace_Grant_Underwood_in_Korean_costume.jpg",
      "caption": "Horace Grant Underwood in Korean costume",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood_in_Korean_costume.jpg",
      "srcColor": "/portraits/gallery/underwood-2-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Horace_G._Underwood_with_his_wife.jpg",
      "caption": "Horace G. Underwood with his wife",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_G._Underwood_with_his_wife.jpg",
      "srcColor": "/portraits/gallery/underwood-3-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Underwood15.jpg/960px-Underwood15.jpg",
      "caption": "Horace Grant Underwood at Fifteen",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood15.jpg",
      "srcColor": "/portraits/gallery/underwood-4-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Underwood24.jpg/960px-Underwood24.jpg",
      "caption": "Horace Grant Underwood at Twenty-four",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood24.jpg",
      "srcColor": "/portraits/gallery/underwood-5-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Underwood1884.jpg/960px-Underwood1884.jpg",
      "caption": "Horace Grant Underwood in 1884",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood1884.jpg",
      "srcColor": "/portraits/gallery/underwood-6-color.jpg"
    }
  ],
  "allen": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Horace_Newton_Allen.jpg",
      "caption": "Horace Newton Allen",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Newton_Allen.jpg",
      "srcColor": "/portraits/gallery/allen-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Korean_ambassadors_and_their_wives_with_Allen_and_his_daughter_%281889%29.jpg/960px-Korean_ambassadors_and_their_wives_with_Allen_and_his_daughter_%281889%29.jpg",
      "caption": "1889.5.6. 마운트 버넌 방문 당시. (왼쪽부터) 이하영, 이채연의 부인, 이채연, 알렌과 알렌의 딸, 이완용, 이완용의 부인",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Korean_ambassadors_and_their_wives_with_Allen_and_his_daughter_(1889).jpg",
      "srcColor": "/portraits/gallery/allen-1-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Foreign_ministers_to_the_Korean_Empire%2C_1901.jpg",
      "caption": "Foreign ministers to the Korean Empire, 1901",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Foreign_ministers_to_the_Korean_Empire,_1901.jpg",
      "srcColor": "/portraits/gallery/allen-2-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1a/WWII_Veteran_Horace_Lucas%2C_CG_Foundation_Director_Al_Benard_%26_Admiral_Allen_at_the_Green_Bay_RB-M_factory._%283008861124%29.jpg",
      "caption": "WWII Veteran Horace Lucas, CG Foundation Director Al Benard &amp; Admiral Allen at the Green Bay RB-M factory.",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:WWII_Veteran_Horace_Lucas,_CG_Foundation_Director_Al_Benard_%26_Admiral_Allen_at_the_Green_Bay_RB-M_factory._(3008861124).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Ethan_Allen_Greenwood_-_Horace_Collamore_-_35.1978_-_Museum_of_Fine_Arts.jpg/960px-Ethan_Allen_Greenwood_-_Horace_Collamore_-_35.1978_-_Museum_of_Fine_Arts.jpg",
      "caption": "Ethan Allen Greenwood   Horace Collamore   35.1978   Museum of Fine Arts",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ethan_Allen_Greenwood_-_Horace_Collamore_-_35.1978_-_Museum_of_Fine_Arts.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Horace_Street%2C_Derry_-_Londonderry_-_geograph.org.uk_-_3066549.jpg",
      "caption": "Horace Street, Derry / Londonderry",
      "source": "Wikimedia Commons · CC BY-SA 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Street,_Derry_-_Londonderry_-_geograph.org.uk_-_3066549.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c4/KoreanOfficer1908.png",
      "caption": "KoreanOfficer1908",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:KoreanOfficer1908.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/%EC%95%8C%EB%A0%8C%EC%9D%98_%EC%A0%95%EB%8F%99%EC%A7%80%EC%97%AD_%EC%8A%A4%EC%BC%80%EC%B9%98.jpg/960px-%EC%95%8C%EB%A0%8C%EC%9D%98_%EC%A0%95%EB%8F%99%EC%A7%80%EC%97%AD_%EC%8A%A4%EC%BC%80%EC%B9%98.jpg",
      "caption": "알렌의 정동지역 스케치",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EC%95%8C%EB%A0%8C%EC%9D%98_%EC%A0%95%EB%8F%99%EC%A7%80%EC%97%AD_%EC%8A%A4%EC%BC%80%EC%B9%98.jpg"
    }
  ],
  "avison": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b6/1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0.jpg",
      "caption": "1904년 세브란스병원에서 병원장인 올리버 R 에비슨의 수술을 보조하는 박서양",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0.jpg",
      "srcColor": "/portraits/gallery/avison-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1d/1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0_2.jpg",
      "caption": "1904년 세브란스병원에서 병원장인 올리버 R 에비슨의 수술을 보조하는 박서양",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0_2.jpg",
      "srcColor": "/portraits/gallery/avison-1-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5b/1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0_3.jpg",
      "caption": "1904년 세브란스병원에서 병원장인 올리버 R 에비슨의 수술을 보조하는 박서양",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:1904%EB%85%84_%EC%A0%9C%EC%A4%91%EC%9B%90_%EC%97%90%EB%B9%84%EC%8A%A8%EC%9D%98_%EC%99%B8%EA%B3%BC_%EC%8B%9C%EC%88%A0_3.jpg",
      "srcColor": "/portraits/gallery/avison-2-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a3/Oliver_R._Avison.jpg",
      "caption": "Photograph of Oliver R Avison",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Oliver_R._Avison.jpg",
      "srcColor": "/portraits/gallery/avison-3-color.jpg"
    }
  ],
  "rosetta": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Dr._Rosetta_Sherwood_Hall_and_children.jpg/960px-Dr._Rosetta_Sherwood_Hall_and_children.jpg",
      "caption": "Dr. Rosetta Sherwood Hall and her children, Edith and Sherwood",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dr._Rosetta_Sherwood_Hall_and_children.jpg",
      "srcColor": "/portraits/gallery/rosetta-1-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Dr._Rosetta_Sherwood_Hall.jpg",
      "caption": "Dr. Rosetta Sherwood Hall",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dr._Rosetta_Sherwood_Hall.jpg",
      "srcColor": "/portraits/gallery/rosetta-2-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Dr._Rosetta_S._Hall.jpg",
      "caption": "Dr. Rosetta Sherwood Hall",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dr._Rosetta_S._Hall.jpg",
      "srcColor": "/portraits/gallery/rosetta-3-color.jpg"
    }
  ],
  "wjhall": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1a/William_James_Hall.jpg",
      "caption": "William James Hall (January 16, 1860 – November 24, 1894)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_James_Hall.jpg",
      "srcColor": "/portraits/gallery/wjhall-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/cb/William_James_Hall_%28cropped%29.jpg",
      "caption": "William James Hall (January 16, 1860 – November 24, 1894)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_James_Hall_(cropped).jpg",
      "srcColor": "/portraits/gallery/wjhall-1-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Scenes_from_the_early_life_of_William_James_Hall.jpg/960px-Scenes_from_the_early_life_of_William_James_Hall.jpg",
      "caption": "Scenes from the early life of William James Hall",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scenes_from_the_early_life_of_William_James_Hall.jpg",
      "srcColor": "/portraits/gallery/wjhall-2-color.jpg"
    }
  ],
  "appenzeller": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/A_Modern_Pioneer_in_Korea_-_Henry_Gerhart_Appenzeller%2C_1901.jpg/960px-A_Modern_Pioneer_in_Korea_-_Henry_Gerhart_Appenzeller%2C_1901.jpg",
      "caption": "Henry Gerhart Appenzeller, 1901.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_Modern_Pioneer_in_Korea_-_Henry_Gerhart_Appenzeller,_1901.jpg",
      "srcColor": "/portraits/gallery/appenzeller-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/KSH_Jeongdong_%2855%29.JPG/960px-KSH_Jeongdong_%2855%29.JPG",
      "caption": "위키백과,정동을 찍다.",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:KSH_Jeongdong_(55).JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Rev.%ED%97%A8%EB%A6%AC%EA%B2%8C%EC%96%B4%ED%95%98%ED%8A%B8%EC%95%84%ED%8E%9C%EC%A0%A4%EB%9F%ACHenryGerhartAppenzeller%EC%84%A0%EA%B5%90%EC%82%AC%EB%8B%98%281858-1902%29%2C%EC%88%9C%EC%A7%81%EC%A7%81%EC%A0%84%2C1902.jpg/960px-Rev.%ED%97%A8%EB%A6%AC%EA%B2%8C%EC%96%B4%ED%95%98%ED%8A%B8%EC%95%84%ED%8E%9C%EC%A0%A4%EB%9F%ACHenryGerhartAppenzeller%EC%84%A0%EA%B5%90%EC%82%AC%EB%8B%98%281858-1902%29%2C%EC%88%9C%EC%A7%81%EC%A7%81%EC%A0%84%2C1902.jpg",
      "caption": "Rev.헨리게어하트아펜젤러HenryGerhartAppenzeller선교사님(1858-1902),1902",
      "source": "Wikimedia Commons · CC BY-SA 2.5",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rev.%ED%97%A8%EB%A6%AC%EA%B2%8C%EC%96%B4%ED%95%98%ED%8A%B8%EC%95%84%ED%8E%9C%EC%A0%A4%EB%9F%ACHenryGerhartAppenzeller%EC%84%A0%EA%B5%90%EC%82%AC%EB%8B%98(1858-1902),%EC%88%9C%EC%A7%81%EC%A7%81%EC%A0%84,1902.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c6/Henry_Appenzeller_and_His_Students.png",
      "caption": "Henry Appenzeller and His Students",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Henry_Appenzeller_and_His_Students.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/A_Modern_Pioneer_in_Korea_-_Appenzeller_and_His_Students%2C_1887.jpg/960px-A_Modern_Pioneer_in_Korea_-_Appenzeller_and_His_Students%2C_1887.jpg",
      "caption": "Appenzeller and His Students, 1887.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_Modern_Pioneer_in_Korea_-_Appenzeller_and_His_Students,_1887.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/28/Henry_Appenzeller%27s_daugter_and_the_Japanese_doll_gifted_by_Saito_Makoto%2C_Governor-General_of_Korea_under_Japanese_rule%2C_1929.png",
      "caption": "ヘンリー・アペンゼラーの孫娘。1929年。朝鮮総督斎藤実から贈られた日本人形とともに",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Henry_Appenzeller%27s_daugter_and_the_Japanese_doll_gifted_by_Saito_Makoto,_Governor-General_of_Korea_under_Japanese_rule,_1929.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/57/Henry_Appenzeller.jpg",
      "caption": "헨리 아펜젤러 목사, Rev. Henry Appenzeller",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Henry_Appenzeller.jpg"
    }
  ],
  "hulbert": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Homer_Bezaleel_Hulbert.jpg",
      "caption": "Korea's Independence activist Homer Bezaleel Hulbert.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Homer_Bezaleel_Hulbert.jpg",
      "srcColor": "/portraits/gallery/hulbert-0-color.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/f4/The_International_folk-lore_congress%2C_Homer_B._Hulbert.png",
      "caption": "Frontispiece to section by Homer B. Hulbert in folklore transactions.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_International_folk-lore_congress,_Homer_B._Hulbert.png",
      "srcColor": "/portraits/gallery/hulbert-1-color.jpg"
    }
  ],
  "mscranton": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/30/Emmett_F._Dwyer%2C_1918_%284379774310%29.jpg",
      "caption": "Emmett F. Dwyer, 1918 (4379774310)",
      "source": "Wikimedia Commons · No restrictions",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Emmett_F._Dwyer,_1918_(4379774310).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Mary_F._Scranton_%281832-1909%29.jpg",
      "caption": "Mary F. Scranton (1832-1909), missionary in Korea",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mary_F._Scranton_(1832-1909).jpg"
    }
  ],
  "sherwoodhall": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Nottingham_MMB_E7_St_Peter%27s_Court.jpg/960px-Nottingham_MMB_E7_St_Peter%27s_Court.jpg",
      "caption": "Nottingham MMB E7 St Peter's Court",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nottingham_MMB_E7_St_Peter%27s_Court.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Deaf%2C_Dumb_and_Blind_Home%2C_Korea%2C_%28s.d.%29_%28Taylor_box21num58%29.jpg/960px-Deaf%2C_Dumb_and_Blind_Home%2C_Korea%2C_%28s.d.%29_%28Taylor_box21num58%29.jpg",
      "caption": "Deaf, Dumb and Blind Home, Korea, (s.d.) (Taylor box21num58)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Deaf,_Dumb_and_Blind_Home,_Korea,_(s.d.)_(Taylor_box21num58).jpg"
    }
  ],
  "reynolds": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/William_Reynolds_Block.jpg/960px-William_Reynolds_Block.jpg",
      "caption": "William Reynolds Block at Yonge and Gould Streets, Toronto, Ontario",
      "source": "Wikimedia Commons · CC BY-SA 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Reynolds_Block.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/00/The_FBI_cast_1969.JPG",
      "caption": "The FBI cast 1969",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_FBI_cast_1969.JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/William_Reynolds-Stephens.JPG/960px-William_Reynolds-Stephens.JPG",
      "caption": "William Reynolds Stephens",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Reynolds-Stephens.JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Finding_the_body_of_Tippoo_Sultan_-_Samuel_William_Reynolds%2C_1800_-_BL_P428.jpg/960px-Finding_the_body_of_Tippoo_Sultan_-_Samuel_William_Reynolds%2C_1800_-_BL_P428.jpg",
      "caption": "Finding the body of Tipu 'Finding the Body Of Tippoo Sultan'. Coloured engraving.",
      "source": "Wikimedia Commons · CC0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Finding_the_body_of_Tippoo_Sultan_-_Samuel_William_Reynolds,_1800_-_BL_P428.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/William_St_Clare._Mezzotint_by_S._W._Reynolds%2C_1820%2C_after_J_Wellcome_V0005179.jpg/960px-William_St_Clare._Mezzotint_by_S._W._Reynolds%2C_1820%2C_after_J_Wellcome_V0005179.jpg",
      "caption": "William St Clare. Mezzotint by S. W. Reynolds, 1820, after J Wellcome V0005179",
      "source": "Wikimedia Commons · CC BY 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_St_Clare._Mezzotint_by_S._W._Reynolds,_1820,_after_J_Wellcome_V0005179.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/0/0e/The_FBI_cast_1969_%28cropped%29.JPG",
      "caption": "The FBI cast 1969 (cropped)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_FBI_cast_1969_(cropped).JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Baseline_Drive-in_Ad_-_16_July_1958%2C_Highland%2C_CA.jpg/960px-Baseline_Drive-in_Ad_-_16_July_1958%2C_Highland%2C_CA.jpg",
      "caption": "Baseline Drive in Ad   16 July 1958, Highland, CA",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Baseline_Drive-in_Ad_-_16_July_1958,_Highland,_CA.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/William_Reynolds_and_Myrna_Hansen.png/960px-William_Reynolds_and_Myrna_Hansen.png",
      "caption": "Still from the American horror film Cult of the Cobra (1955).",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Reynolds_and_Myrna_Hansen.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/William_H_Reynolds.png/960px-William_H_Reynolds.png",
      "caption": "William H Reynolds, Publicity Headshot by Amos Carr",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_H_Reynolds.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/A_Royal_Game%2C_William_Reynolds-Stephens_%281862%E2%80%931943%29_Tate.jpg/960px-A_Royal_Game%2C_William_Reynolds-Stephens_%281862%E2%80%931943%29_Tate.jpg",
      "caption": "Ein königliches Spiel, William Reynolds-Stephens (1862-1943) Tate",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_Royal_Game,_William_Reynolds-Stephens_(1862%E2%80%931943)_Tate.jpg"
    }
  ],
  "gilseonju": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a7/%EA%B8%B8%EC%84%A0%EC%A3%BC%28%EB%8F%99%EC%95%84%EC%9D%BC%EB%B3%B4_1935%29.jpg",
      "caption": "길선주(동아일보 1935)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EA%B8%B8%EC%84%A0%EC%A3%BC(%EB%8F%99%EC%95%84%EC%9D%BC%EB%B3%B4_1935).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1b/%EA%B8%B8%EC%84%A0%EC%A3%BC%28%EC%A1%B0%EC%84%A0%EC%9D%BC%EB%B3%B4_1934%29.jpg",
      "caption": "길선주(조선일보 1934)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EA%B8%B8%EC%84%A0%EC%A3%BC(%EC%A1%B0%EC%84%A0%EC%9D%BC%EB%B3%B4_1934).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/ee/%EA%B8%B8%EC%84%A0%EC%A3%BC.jpg",
      "caption": "길선주 목사의 사진",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EA%B8%B8%EC%84%A0%EC%A3%BC.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Korean_Declaration_of_Independence.jpg/960px-Korean_Declaration_of_Independence.jpg",
      "caption": "Korean Declaration of Independence",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Korean_Declaration_of_Independence.jpg"
    }
  ],
  "leegipung": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b3/%EC%9D%B4%EA%B8%B0%ED%92%8D.jpg",
      "caption": "이기풍의 모습.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EC%9D%B4%EA%B8%B0%ED%92%8D.jpg"
    }
  ],
  "seogyeongjo": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/69/%EC%84%9C%EA%B2%BD%EC%A1%B0%28%E5%BE%90%E6%99%AF%E7%A5%9A%29.jpg",
      "caption": "서경조(徐景祚)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EC%84%9C%EA%B2%BD%EC%A1%B0(%E5%BE%90%E6%99%AF%E7%A5%9A).jpg"
    }
  ],
  "kimchangsik": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Rev._Kim_Chang-Sik%2C_Korea%2C_%28s.d.%29_%28Taylor_box21num66%29.jpg/960px-Rev._Kim_Chang-Sik%2C_Korea%2C_%28s.d.%29_%28Taylor_box21num66%29.jpg",
      "caption": "Rev. Kim Chang Sik, Korea, (s.d.) (Taylor box21num66)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rev._Kim_Chang-Sik,_Korea,_(s.d.)_(Taylor_box21num66).jpg"
    }
  ],
  "schofield": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/25th_CAB_welcomes_new_commander_130430-A-UG106-482.jpg/960px-25th_CAB_welcomes_new_commander_130430-A-UG106-482.jpg",
      "caption": "25th CAB welcomes new commander 130430 A UG106 482",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:25th_CAB_welcomes_new_commander_130430-A-UG106-482.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Special_Orders%2C_No._266%2C_Head_Quarters%2C_Department_of_the_Mo.%2C_St._Louis%2C_Mo.%2C_signed_Frank_Eno%2C_September_29%2C_1863.jpg/960px-Special_Orders%2C_No._266%2C_Head_Quarters%2C_Department_of_the_Mo.%2C_St._Louis%2C_Mo.%2C_signed_Frank_Eno%2C_September_29%2C_1863.jpg",
      "caption": "Special Orders, No. 266, Head Quarters, Department of the Mo., St. Louis, Mo., signed Frank Eno, September 29, 1863",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Special_Orders,_No._266,_Head_Quarters,_Department_of_the_Mo.,_St._Louis,_Mo.,_signed_Frank_Eno,_September_29,_1863.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/D%C3%A9l%C3%A9gu%C3%A9s_de_la_conf%C3%A9rence_navale_de_Gen%C3%A8ve_%28de_droite_%C3%A0_gauche%29_amiral_J._M._Reeves%2C_capitaine_W._W._Smyth%2C_amiral_Frank_Schofield%2C_le_commandant_H._Train%2C_amiral_Jones%2C_capitaine_Andrews%2C_commandant_Frost..._-_btv1b53188326c.jpg/960px-thumbnail.jpg",
      "caption": "Délégués de la conférence navale de Genève (de droite à gauche) amiral J. M. Reeves, capitaine W. W. Smyth, amiral Frank Schofield, le commandant H. Train, amiral Jones, capitaine Andrews, commandant Frost...   btv1b53188326c",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:D%C3%A9l%C3%A9gu%C3%A9s_de_la_conf%C3%A9rence_navale_de_Gen%C3%A8ve_(de_droite_%C3%A0_gauche)_amiral_J._M._Reeves,_capitaine_W._W._Smyth,_amiral_Frank_Schofield,_le_commandant_H._Train,_amiral_Jones,_capitaine_Andrews,_commandant_Frost..._-_btv1b53188326c.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SchofieldRheeMeeting1958.png/960px-SchofieldRheeMeeting1958.png",
      "caption": "Frank Schofield meets South Korean president Syngman Rhee, 1958",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:SchofieldRheeMeeting1958.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/22/Scofield_Jail.jpg",
      "caption": "Historic Scofield Utah Jail",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scofield_Jail.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Paul_Scofield_Allan_Warren.jpg/960px-Paul_Scofield_Allan_Warren.jpg",
      "caption": "Paul Scofield Allan Warren",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Paul_Scofield_Allan_Warren.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Paul_Scofield_2_Allan_Warren.jpg/960px-Paul_Scofield_2_Allan_Warren.jpg",
      "caption": "Paul Scofield at photographer's studio london",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Paul_Scofield_2_Allan_Warren.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Paul_Scofield_10_Allan_Warren.jpg/960px-Paul_Scofield_10_Allan_Warren.jpg",
      "caption": "Paul Scofield taken in photographer's studio",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Paul_Scofield_10_Allan_Warren.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Paul_Scofield_64_Allan_Warren.jpg/960px-Paul_Scofield_64_Allan_Warren.jpg",
      "caption": "Paul Scofield taken at photographer's studio London",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Paul_Scofield_64_Allan_Warren.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Scofield-lovano.jpg/960px-Scofield-lovano.jpg",
      "caption": "John Scofield and Joe Lovano live at Victoria Jazz House in Oslo, Norway.",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scofield-lovano.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Scofield_UT_dyeclan.com_-_panoramio_%281%29.jpg/960px-Scofield_UT_dyeclan.com_-_panoramio_%281%29.jpg",
      "caption": "Scofield UT",
      "source": "Wikimedia Commons · CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scofield_UT_dyeclan.com_-_panoramio_(1).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Scofield-Sanor_House_1.jpg/960px-Scofield-Sanor_House_1.jpg",
      "caption": "Scofield Sanor House 1",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scofield-Sanor_House_1.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/The_Energy_Loop-_Huntington-Eccles_Canyons_Scenic_Byway_-_Scofield_Town_Cemetery_-_NARA_-_7722372.jpg/960px-The_Energy_Loop-_Huntington-Eccles_Canyons_Scenic_Byway_-_Scofield_Town_Cemetery_-_NARA_-_7722372.jpg",
      "caption": "The Energy Loop  Huntington Eccles Canyons Scenic Byway   Scofield Town Cemetery   NARA   7722372",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Energy_Loop-_Huntington-Eccles_Canyons_Scenic_Byway_-_Scofield_Town_Cemetery_-_NARA_-_7722372.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Southwest_on_SR-96_at_Scofield%2C_Utah%2C_Dec_16.jpg/960px-Southwest_on_SR-96_at_Scofield%2C_Utah%2C_Dec_16.jpg",
      "caption": "Southwest on SR 96 at Scofield, Utah, Dec 16",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Southwest_on_SR-96_at_Scofield,_Utah,_Dec_16.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/North_on_SR-96_entering_Scofield%2C_Utah%2C_Dec_16.jpg/960px-North_on_SR-96_entering_Scofield%2C_Utah%2C_Dec_16.jpg",
      "caption": "North along Utah State Route 96 as it enters Scofield, Utah, December 2016",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:North_on_SR-96_entering_Scofield,_Utah,_Dec_16.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/John_Scofield_%28cropped%29-8643.jpg/960px-John_Scofield_%28cropped%29-8643.jpg",
      "caption": "Jazz guitarist John Scofield at the Moers Festival 2021",
      "source": "Wikimedia Commons · CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:John_Scofield_(cropped)-8643.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Scofield_Mine_Disaster.jpg",
      "caption": "Scofield Mine Disaster",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Scofield_Mine_Disaster.jpg"
    }
  ],
  "hhunderwood": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/%28Missouri%29_Underwood%2C_Horace_-_Engineers%27_Regiment_of_the_West%2C_Volunteers%2C_Company_H_-_DPLA_-_4f0aec094193e3e886c374ae46041a7c.jpg/960px-%28Missouri%29_Underwood%2C_Horace_-_Engineers%27_Regiment_of_the_West%2C_Volunteers%2C_Company_H_-_DPLA_-_4f0aec094193e3e886c374ae46041a7c.jpg",
      "caption": "The volunteer's Enlistment Rank is listed as Musc, and the Discharge Rank is listed as Artfr.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:(Missouri)_Underwood,_Horace_-_Engineers%27_Regiment_of_the_West,_Volunteers,_Company_H_-_DPLA_-_4f0aec094193e3e886c374ae46041a7c.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Horace_Grant_Underwood.jpg",
      "caption": "Horace Grant Underwood",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Horace_Grant_Underwood_in_1916.jpg",
      "caption": "Horace Grant Underwood in 1916",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood_in_1916.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/2/29/Horace_Grant_Underwood_in_Korean_costume.jpg",
      "caption": "Horace Grant Underwood in Korean costume",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_Grant_Underwood_in_Korean_costume.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Horace_G._Underwood_with_his_wife.jpg",
      "caption": "Horace G. Underwood with his wife",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Horace_G._Underwood_with_his_wife.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Underwood15.jpg/960px-Underwood15.jpg",
      "caption": "Horace Grant Underwood at Fifteen",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood15.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Underwood24.jpg/960px-Underwood24.jpg",
      "caption": "Horace Grant Underwood at Twenty-four",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood24.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Underwood1884.jpg/960px-Underwood1884.jpg",
      "caption": "Horace Grant Underwood in 1884",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Underwood1884.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/4f/%EC%A1%B0%EC%84%A0_%EC%B5%9C%EC%B4%88%EC%9D%98_%EC%9C%A0%EC%95%84%EC%84%B8%EB%A1%80%EC%9E%90.png",
      "caption": "조선 최초의 유아세례자의 일부, 윗줄은 좌로부터 서병호, 김규식, 앉은 이는 김일, 원한경 순",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:%EC%A1%B0%EC%84%A0_%EC%B5%9C%EC%B4%88%EC%9D%98_%EC%9C%A0%EC%95%84%EC%84%B8%EB%A1%80%EC%9E%90.png"
    }
  ],
  "linton": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/e/e2/William_Linton._Self-Portrait.jpg",
      "caption": "William Linton. Self-Portrait.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Linton._Self-Portrait.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/50/WilliamSLinton.jpg",
      "caption": "William S. Linton, US Representative from Michigan",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:WilliamSLinton.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Rev_William_Richardson_Linton_handwriting_source.jpg",
      "caption": "Handwriting source of Rev. William Richardson Linton.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rev_William_Richardson_Linton_handwriting_source.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Thomas_Coram._Wood_engraving_by_W._J._Linton_after_W._Hogart_Wellcome_V0001283.jpg/960px-Thomas_Coram._Wood_engraving_by_W._J._Linton_after_W._Hogart_Wellcome_V0001283.jpg",
      "caption": "Thomas Coram. Wood engraving by W. J. Linton after W. Hogart Wellcome V0001283",
      "source": "Wikimedia Commons · CC BY 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Thomas_Coram._Wood_engraving_by_W._J._Linton_after_W._Hogart_Wellcome_V0001283.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Thomas_Southwood_Smith._Wood_engraving_by_W._J._Linton_after_Wellcome_V0005500.jpg/960px-Thomas_Southwood_Smith._Wood_engraving_by_W._J._Linton_after_Wellcome_V0005500.jpg",
      "caption": "Thomas Southwood Smith. Wood engraving by W. J. Linton after Wellcome V0005500",
      "source": "Wikimedia Commons · CC BY 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Thomas_Southwood_Smith._Wood_engraving_by_W._J._Linton_after_Wellcome_V0005500.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/W._J._Linton_%281812-1897%29_design_for_The_Cornhill_Magazine_front%2C_on_a_copy_dated_December_1945.jpg/960px-W._J._Linton_%281812-1897%29_design_for_The_Cornhill_Magazine_front%2C_on_a_copy_dated_December_1945.jpg",
      "caption": "W. J. Linton (1812 1897) design for The Cornhill Magazine front, on a copy dated December 1945",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:W._J._Linton_(1812-1897)_design_for_The_Cornhill_Magazine_front,_on_a_copy_dated_December_1945.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Picture_of_William_James_Linton.jpg",
      "caption": "William James Linton.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Picture_of_William_James_Linton.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/63/William_Richardson_Linton.jpg",
      "caption": "William Richardson Linton",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Richardson_Linton.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/William_Seelye_Linton_%281856-1927%29_%2810506726825%29.jpg/960px-William_Seelye_Linton_%281856-1927%29_%2810506726825%29.jpg",
      "caption": "William Seelye Linton (1856 1927) (10506726825)",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Seelye_Linton_(1856-1927)_(10506726825).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/William_Seelye_Linton_%281856-1927%29_%2810506726825%29_%281%29.jpg/960px-William_Seelye_Linton_%281856-1927%29_%2810506726825%29_%281%29.jpg",
      "caption": "William Seelye Linton (1856 1927) (10506726825) (1)",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Seelye_Linton_(1856-1927)_(10506726825)_(1).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c1/William_Linton_%281791-1876%29_-_Mistra_-_493_-_Fitzwilliam_Museum.jpg",
      "caption": "William Linton (1791 1876)   Mistra   493   Fitzwilliam Museum",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Linton_(1791-1876)_-_Mistra_-_493_-_Fitzwilliam_Museum.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Signature_of_William_James_Linton.png",
      "caption": "Signature of William James Linton",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Signature_of_William_James_Linton.png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Lancaster_from_the_Stone_Quarry_by_William_Linton_%281852%29.png",
      "caption": "View of Lancaster from quarry now the site of Williamson Park",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lancaster_from_the_Stone_Quarry_by_William_Linton_(1852).png"
    }
  ],
  "maclay": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/68/Robert_Samuel_Maclay.JPG",
      "caption": "Photo of Robert Samuel Maclay",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Samuel_Maclay.JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Robert_Samuel_Maclay_2.jpg",
      "caption": "Portrait of Robert Samuel Maclay",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Samuel_Maclay_2.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Robert_Samuel_Maclay_3.jpg",
      "caption": "Photo of Robert Samuel Maclay",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Samuel_Maclay_3.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/4/49/Robert_Maclay_Widney_ca1885.jpg",
      "caption": "Robert Maclay Widney ca1885",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Maclay_Widney_ca1885.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Signature_of_Robert_Maclay_%281834%E2%80%931898%29.png",
      "caption": "Signature of Robert Maclay (1834–1898)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Signature_of_Robert_Maclay_(1834%E2%80%931898).png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Robert_Maclay_%281834%E2%80%931898%29.png",
      "caption": "Robert Maclay (1834–1898)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Maclay_(1834%E2%80%931898).png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/9/9b/Robert_S._Maclay.jpg",
      "caption": "ロバート・S・マクレイ",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_S._Maclay.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/65/Robert_Maclay_Widney_ca1885_3x4.jpg",
      "caption": "Robert Maclay Widney ca1885 3x4",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Robert_Maclay_Widney_ca1885_3x4.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Conference_on_Facilitating_the_Entry_into_Force_of_the_CTBT_-_Flickr_-_The_Official_CTBTO_Photostream_%2818%29.jpg/960px-Conference_on_Facilitating_the_Entry_into_Force_of_the_CTBT_-_Flickr_-_The_Official_CTBTO_Photostream_%2818%29.jpg",
      "caption": "Conference on Facilitating the Entry into Force of the CTBT   Flickr   The Official CTBTO Photostream (18)",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Conference_on_Facilitating_the_Entry_into_Force_of_the_CTBT_-_Flickr_-_The_Official_CTBTO_Photostream_(18).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/New_Zealand_Cabinet%2C_1981.jpg/960px-New_Zealand_Cabinet%2C_1981.jpg",
      "caption": "New Zealand Cabinet, 1981",
      "source": "Wikimedia Commons · CC BY-SA 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:New_Zealand_Cabinet,_1981.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Jim_McLay_%28cropped%29.jpg",
      "caption": "Jim McLay (cropped)",
      "source": "Wikimedia Commons · CC BY 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_(cropped).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Jim_McLay_KNZM_investiture.jpg/960px-Jim_McLay_KNZM_investiture.jpg",
      "caption": "Jim McLay KNZM investiture",
      "source": "Wikimedia Commons · CC BY 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_KNZM_investiture.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jim_McLay_depositing_New_Zealand%27s_ratification_instrument.jpg/960px-Jim_McLay_depositing_New_Zealand%27s_ratification_instrument.jpg",
      "caption": "Jim McLay depositing New Zealand's ratification instrument",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_depositing_New_Zealand%27s_ratification_instrument.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Jim_McLay.jpg",
      "caption": "Jim McLay",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/65/Jim_McLay_%28blue_background%29.jpg",
      "caption": "Jim McLay (blue background)",
      "source": "Wikimedia Commons · CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_(blue_background).jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Jim_McLay_1986.jpg",
      "caption": "Jim McLay 1986",
      "source": "Wikimedia Commons · CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_1986.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Jim_McLay_1986_%28cropped%29.jpg",
      "caption": "Jim McLay 1986",
      "source": "Wikimedia Commons · CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jim_McLay_1986_(cropped).jpg"
    }
  ],
  "noble": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/William_Cotton_by_Matthew_Noble_1855.JPG/960px-William_Cotton_by_Matthew_Noble_1855.JPG",
      "caption": "William Cotton by Matthew Noble 1855",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Cotton_by_Matthew_Noble_1855.JPG"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/William_Shakespeare_-_Noble_Street_EC2.jpg/960px-William_Shakespeare_-_Noble_Street_EC2.jpg",
      "caption": "William Shakespeare   Noble Street EC2",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Shakespeare_-_Noble_Street_EC2.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/13/Signature_of_William_Clark_Noble_%281858%E2%80%931938%29.png",
      "caption": "Signature of William Clark Noble (1858–1938)",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Signature_of_William_Clark_Noble_(1858%E2%80%931938).png"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/William_Noble_Hardwick_-_William_Noble_Hardwick.jpg/960px-William_Noble_Hardwick_-_William_Noble_Hardwick.jpg",
      "caption": "William Noble Hardwick   William Noble Hardwick",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Noble_Hardwick_-_William_Noble_Hardwick.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/5/5e/William_Noble_Hardwick_-_A_Continental_canal_landscape%2C_watercolour%2C_signed_with_initials_lower_right_H_54_x_W_74_cm.jpg",
      "caption": "William Noble Hardwick   A Continental canal landscape, watercolour, signed with initials lower right H 54 x W 74 cm",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Noble_Hardwick_-_A_Continental_canal_landscape,_watercolour,_signed_with_initials_lower_right_H_54_x_W_74_cm.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/3/3d/William_Noble_Hardwick_-_watercolour%2C_%27Benglog%2C_North_Wales%27%2C_signed_and_dated_1846%2C_14_x_20in.jpg",
      "caption": "William Noble Hardwick (1805-1865) watercolour, 'Benglog, North Wales', signed and dated 1846, 14 x 20in.",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Noble_Hardwick_-_watercolour,_%27Benglog,_North_Wales%27,_signed_and_dated_1846,_14_x_20in.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/1/1d/William_Noble_Hardwick_-_d3b2707c45.jpg",
      "caption": "William Noble Hardwick   d3b2707c45",
      "source": "Wikimedia Commons · Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:William_Noble_Hardwick_-_d3b2707c45.jpg"
    },
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sir_William_Noble.png/960px-Sir_William_Noble.png",
      "caption": "Digital line drawing of Sir William Noble",
      "source": "Wikimedia Commons · CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sir_William_Noble.png"
    }
  ],
  "fenwick": [
    {
      "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/The_Forfar_Directory_and_Yearbook_1905_%281905%29_%2814594433488%29.jpg/960px-The_Forfar_Directory_and_Yearbook_1905_%281905%29_%2814594433488%29.jpg",
      "caption": "The Forfar Directory and Yearbook 1905 (1905) (14594433488)",
      "source": "Wikimedia Commons · No restrictions",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Forfar_Directory_and_Yearbook_1905_(1905)_(14594433488).jpg"
    }
  ]
};

export const galleryFor = (id: string): GalleryPhoto[] => GALLERY[id] ?? [];
