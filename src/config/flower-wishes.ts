/**
 * Nội dung lời chúc theo từng loài hoa của mini-game "gieo một lời chúc". Đổi chữ ở đây là đổi trang.
 * `id` khớp `src/config/flower-botanical.ts` (hình dáng, màu, thời lượng nở) và `FLOWER_IDS` trong `apps-script/wishes.gs`.
 */
export interface FlowerWish {
  id: string;
  name: string;
  /** Chủ đề ngắn hiện dưới tên hoa */
  theme: string;
  plant: string;
  /** Câu hiện khi hạt nảy mầm */
  message: string;
  /** Gợi ý luân phiên làm placeholder ô lời chúc */
  prompts: string[];
  /** Lời chúc mẫu điền sẵn (khách sửa tự do) */
  wishes: string[];
  /** Lời cảm ơn hiện sau khi gửi */
  replies: string[];
}

export const flowerWishes: FlowerWish[] = [
  {
    id: "baby-breath",
    name: "Hoa baby",
    theme: "Bình yên và bền lâu",
    plant: "baby-breath",
    message:
      "Baby’s breath — hoa baby — mang vẻ đẹp mong manh với những chùm hoa trắng li ti, tựa những đám mây nhỏ vương trên cành lá. Không rực rỡ hay phô trương, loài hoa vẫn khiến người ta nhớ mãi bởi nét tinh khôi, dịu dàng và ý nghĩa về những tình cảm chân thành, thuần khiết.",
    prompts: [
      "Gửi hai bạn một lời chúc dịu dàng, mong bình yên ở lại trong từng ngày chung đôi.",
      "Mong mái nhà mai sau luôn ấm ánh đèn, đầy tiếng cười và những điều thân quen.",
      "Chúc tình yêu nhỏ hôm nay lớn lên cùng năm tháng, bền lòng qua mọi đổi thay.",
    ],
    wishes: [
      "Mong hai bạn đi cùng nhau qua những mùa nắng mưa, để năm tháng có trôi xa, bàn tay vẫn tìm bàn tay và lòng vẫn chọn ở lại bên nhau.",
      "Chúc mái nhà nhỏ luôn thơm mùi cơm mới, sáng ánh đèn khuya; ngoài kia dẫu có bộn bề, trở về bên nhau là thấy lòng bình yên.",
      "Mong hạnh phúc không chỉ nằm trong ngày cưới rực rỡ, mà còn nở trong bữa cơm thường nhật, trong lời hỏi han và những buổi chiều ngồi cạnh nhau.",
      "Chúc hai bạn dù cuộc sống có cuốn đi qua bao bận rộn, vẫn dành cho nhau một khoảng trời riêng, nơi mọi mỏi mệt đều được dịu dàng vỗ về.",
      "Mong người này luôn là chốn về của người kia, là bờ vai khi mỏi mệt, là tiếng cười trong ngày vui và là bình yên giữa những tháng năm dài.",
      "Chúc hai bạn thương nhau từ thuở tóc còn xanh đến khi bạc mái đầu, qua bao mùa hoa nở vẫn giữ nguyên một lòng son sắt.",
      "Mong gia đình nhỏ của hai bạn luôn đầy ắp điều lành, tiếng cười vang nhẹ bên hiên và yêu thương cứ thế lớn lên qua từng ngày.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến chúng mình một lời chúc dịu dàng. Mong những điều bình yên ấy sẽ theo hai đứa qua thật nhiều mùa thương.",
      "Lời chúc của bạn như một nhành hoa nhỏ, nhẹ nhàng mà ấm áp. Chúng mình xin cất giữ trong ngày vui này.",
      "Cảm ơn bạn đã góp một chút yêu thương vào câu chuyện của chúng mình. Mong ngày nào cũng có dịp gặp nhau trong niềm vui.",
      "Đọc lời chúc của bạn, chúng mình thấy lòng ấm hơn một chút. Cảm ơn bạn đã nhớ và thương hai đứa trong ngày đặc biệt.",
      "Chúng mình xin nhận lời chúc thật đẹp này, rồi sẽ cùng nhau vun vén để mái nhà luôn là nơi bình yên nhất.",
      "Một lời chúc nhỏ mà làm ngày vui thêm đầy. Cảm ơn bạn đã gửi đến hai đứa thật nhiều tình cảm.",
    ],
  },
  {
    id: "peony",
    name: "Hoa mẫu đơn",
    theme: "Hạnh phúc viên mãn",
    plant: "peony",
    message:
      "Mẫu đơn cuốn hút bởi những lớp cánh mềm mại xếp chồng lên nhau, tạo thành đóa hoa tròn đầy và kiêu sa. Từ lâu, loài hoa này đã gắn với vẻ đẹp phú quý, thịnh vượng và sự viên mãn, như một nét rực rỡ mà thiên nhiên dành riêng cho những điều đáng trân trọng.",
    prompts: [
      "Chúc hai bạn một đời đủ đầy, lòng luôn an vui và nhà luôn ấm áp.",
      "Mong những ước mơ chung được vun trồng, rồi một ngày nở hoa như ý.",
      "Gửi hai bạn lời chúc sung túc, thuận hòa và nhiều mùa hạnh phúc.",
    ],
    wishes: [
      "Chúc hai bạn có một mái nhà đủ đầy tiếng cười, công việc thuận buồm xuôi gió, những dự định dần thành hiện thực và mỗi ngày đều có điều đáng mong chờ.",
      "Mong hạnh phúc của hai bạn không chỉ đủ đầy trong vật chất, mà còn phong phú trong yêu thương, rộng rãi trong sẻ chia và ấm áp trong từng lời nói.",
      "Chúc những điều tốt lành lần lượt ghé thăm, những cánh cửa mới nhẹ nhàng mở ra và hai bạn luôn có nhau để cùng đón nhận mọi mùa may mắn.",
      "Mong mỗi năm đi qua, cuộc sống lại thêm khởi sắc, ước mơ thêm gần trong tầm tay và tình yêu vẫn đong đầy như buổi đầu chung bước.",
      "Chúc hai bạn cùng gây dựng một mái ấm như mong ước, có của ăn của để, có người sẻ chia, có niềm vui nho nhỏ và có nhau qua mọi thăng trầm.",
      "Mong những chuyến đi xa sẽ mở rộng chân trời, những dự định lớn sẽ gặp ngày thuận lợi và mỗi thành quả đều trở thành niềm vui chung của hai người.",
      "Chúc hai bạn trong ngày thành công có người cùng nâng ly chúc mừng, khi lòng chùng xuống có một bờ vai để tựa, và suốt đời chẳng thiếu yêu thương.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến hai đứa lời chúc đủ đầy và nhiều hy vọng. Chúng mình mong sẽ cùng nhau vun đắp từng điều tốt đẹp ấy.",
      "Lời chúc thật đẹp, chúng mình xin nhận cùng tất cả niềm vui của ngày hôm nay. Mong điều lành cũng sẽ ghé thăm bạn thật nhiều.",
      "Cảm ơn bạn đã chúc phúc cho mái nhà nhỏ sắp được dựng xây. Chúng mình sẽ cùng nhau chăm chút để yêu thương ngày một đơm hoa.",
      "Có thêm lời chúc của bạn, ngày vui như được nắng hong ấm hơn. Cảm ơn bạn đã gửi đến chúng mình những điều tốt lành.",
      "Mong niềm vui hôm nay sẽ theo chúng mình qua những năm tháng sau này. Cảm ơn bạn đã cùng chia sẻ khoảnh khắc đáng nhớ.",
      "Chúng mình xin giữ lời chúc này như một món quà tinh thần thật quý. Chúc bạn cũng gặp nhiều may mắn trên đường đời.",
    ],
  },
  {
    id: "daisy",
    name: "Cúc họa mi",
    theme: "Niềm vui giản dị",
    plant: "daisy",
    message:
      "Cúc họa mi có những cánh hoa trắng mảnh khẽ xòe quanh nhụy vàng, nhỏ bé mà sáng trong giữa những ngày cuối thu. Vẻ đẹp mộc mạc của loài hoa gợi nhắc đến sự giản dị, thuần khiết và niềm vui bình yên vẫn nở ra từ những điều đời thường nhất.",
    prompts: [
      "Chúc hai bạn giữ mãi tiếng cười trong veo giữa những ngày bình thường.",
      "Mong bữa cơm giản dị nào cũng có chuyện vui để kể cùng nhau.",
      "Gửi đôi bạn một lời chúc vui tươi, nhẹ nhàng như một sớm đầy hoa.",
    ],
    wishes: [
      "Mong ngày nào hai bạn cũng có chuyện vui để kể, có điều nhỏ bé để mong và có một người luôn sẵn lòng lắng nghe từ đầu đến cuối.",
      "Chúc sau bao năm chung sống, hai bạn vẫn rủ nhau đi hẹn hò, vẫn thích trêu đùa như thuở mới yêu và vẫn cười vì những chuyện chẳng ai hiểu.",
      "Mong căn bếp luôn thơm mùi món ngon, bàn ăn luôn có người chờ đợi và buổi tối nào cũng đủ thong thả để kể nhau nghe chuyện một ngày qua.",
      "Chúc hai bạn tìm thấy niềm vui trong những điều giản đơn: một tách trà nóng, một chiều đi dạo, một cái ôm bất chợt và một người luôn ở cạnh.",
      "Mong có giận hờn thì cũng chóng nguôi, có bất đồng thì cùng ngồi lại, để cuối ngày vẫn nắm tay nhau và chẳng ai phải buồn quá lâu.",
      "Chúc ngôi nhà luôn rộn ràng tiếng cười, cửa sổ đón nắng ban mai, ngoài hiên có hoa nở và trong lòng hai bạn luôn có một niềm vui để trở về.",
      "Mong cuộc sống chung vừa đủ bình yên để nghỉ ngơi, vừa đủ bất ngờ để háo hức, và đủ yêu thương để ngày thường cũng hóa thành ngày đáng nhớ.",
    ],
    replies: [
      "Cảm ơn bạn nha, chúng mình sẽ cố gắng giữ tiếng cười ở lại trong nhà qua thật nhiều ngày tháng.",
      "Lời chúc dễ thương quá, đọc xong thấy vui lây. Cảm ơn bạn đã làm ngày cưới của chúng mình thêm rộn ràng.",
      "Nhất định sẽ có nhiều bữa ăn ngon và những câu chuyện dài để kể. Cảm ơn bạn đã chúc phúc cho hai đứa!",
      "Cảm ơn bạn đã gửi đến chúng mình một niềm vui nho nhỏ, vừa đủ làm ngày hôm nay thêm ấm áp.",
      "Chúng mình xin nhận lời chúc đáng yêu này, hứa sẽ giận ít thôi, cười nhiều hơn và thương nhau thật lâu.",
      "Mong sớm có dịp gặp lại bạn để kể thêm chuyện vui. Cảm ơn bạn đã dành tình cảm cho hai đứa.",
    ],
  },
  {
    id: "tulip",
    name: "Hoa tulip",
    theme: "Tình yêu chân thành",
    plant: "tulip",
    message:
      "Những cánh tulip ôm lấy nhau thành dáng hoa thanh nhã, đường nét giản đơn mà vẫn đầy sức sống. Mỗi sắc hoa mang một vẻ riêng: trắng tinh khôi, hồng dịu dàng hay đỏ nồng nàn; tất cả cùng làm nên biểu tượng của tình yêu, sự duyên dáng và những cảm xúc được nâng niu.",
    prompts: [
      "Chúc hai bạn luôn chọn nhau bằng sự chân thành, qua tháng ngày và đổi thay.",
      "Mong hai người biết lắng nghe, tôn trọng và dịu dàng với những khác biệt.",
      "Gửi một lời chúc cho tình yêu càng đi lâu càng thêm sâu sắc.",
    ],
    wishes: [
      "Chúc hai bạn yêu nhau bằng những điều chân thật, không chỉ bằng lời ngọt ngào trong ngày vui, mà bằng sự tử tế được gìn giữ qua từng ngày thường.",
      "Mong nhiều năm sau, khi nhìn lại nhau giữa căn nhà thân thuộc, hai bạn vẫn thấy trong ánh mắt kia chút dịu dàng đã khiến mình rung động thuở ban đầu.",
      "Chúc hai bạn đủ kiên nhẫn để nghe nhau nói hết lời, đủ bao dung để hiểu những điều chưa hoàn hảo và đủ tin yêu để cùng bước qua giông gió.",
      "Mong tình yêu không chỉ sâu đậm trong những ngày nắng đẹp, mà còn bền lòng khi mưa về, khi mỏi mệt và khi cuộc đời cần cả hai cùng cố gắng.",
      "Chúc hai bạn vừa là người thương, vừa là bạn thân, là đồng đội trong những dự định lớn và là chốn bình yên khi một người cần được nghỉ ngơi.",
      "Mong hai bạn luôn nhớ điều đã đưa mình đến bên nhau, rồi cùng viết tiếp câu chuyện ấy bằng những lựa chọn tử tế, những lời thật lòng và sự quan tâm mỗi ngày.",
      "Chúc lời hứa trong ngày cưới không chỉ ở lại trong ký ức, mà sẽ hiện diện trong từng hành động nhỏ, để năm tháng càng dài, niềm tin càng vững vàng.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi một lời chúc chân thành đến chúng mình. Chúng mình sẽ cùng nhau học cách yêu thương tốt hơn qua từng ngày.",
      "Lời chúc này thật ý nghĩa, chúng mình xin giữ như một kỷ niệm đẹp trong ngày nên duyên.",
      "Cảm ơn bạn đã tin vào tình yêu và gửi đến hai đứa những lời dịu dàng. Mong chúng mình luôn xứng đáng với tình cảm ấy.",
      "Chúng mình sẽ nhớ rằng yêu thương không chỉ nằm ở lời nói, mà còn ở cách lắng nghe và ở bên nhau. Cảm ơn bạn nhiều nhé!",
      "Cảm ơn bạn đã chúc phúc cho hành trình chung của hai đứa. Mong chúng mình sẽ cùng nhau gìn giữ những điều đẹp đẽ này thật lâu.",
      "Nhận được lời chúc của bạn, ngày vui càng thêm sâu sắc. Chúng mình gửi lại bạn thật nhiều thương mến.",
    ],
  },
  {
    id: "sunflower",
    name: "Hoa hướng dương",
    theme: "Lạc quan và đồng hành",
    plant: "sunflower",
    message:
      "Hướng dương nổi bật với những cánh vàng rực rỡ bao quanh nhụy nâu, dáng hoa luôn gợi về ánh mặt trời ấm áp. Bởi sức sống mạnh mẽ và hình ảnh hướng về phía sáng, loài hoa thường tượng trưng cho niềm tin, sự lạc quan và lòng kiên định trước những đổi thay.",
    prompts: [
      "Chúc hai bạn luôn là ánh nắng, tiếp thêm can đảm cho nhau trên đường dài.",
      "Mong những ước mơ chung được chăm chút mỗi ngày rồi một ngày thành hoa.",
      "Gửi hai bạn lời chúc cho hành trình phía trước luôn sáng và đầy hy vọng.",
    ],
    wishes: [
      "Chúc hai bạn luôn giữ trong lòng một khoảng trời sáng, để khi khó khăn ghé đến vẫn có niềm tin nâng bước và có người thương cùng mình đi tiếp.",
      "Mong mỗi ngày trôi qua đều đem đến một lý do để tự hào về nhau, từ những thành công lớn lao đến những cố gắng thầm lặng chẳng mấy ai nhìn thấy.",
      "Chúc những kế hoạch còn nằm trên trang giấy sẽ dần thành hình, những ước mơ còn ở phía xa sẽ gần hơn sau từng bước chân chung sức.",
      "Mong hai bạn được cùng nhau đi qua nhiều miền đất lạ, đón những bình minh mới, gom thật nhiều kỷ niệm và trở về với trái tim đầy ắp chuyện vui.",
      "Chúc dù công việc có bận rộn, mỗi người vẫn là nguồn động viên dịu dàng của người kia, là lời tin tưởng khi chùn bước và là niềm vui khi thành công.",
      "Mong cả hai đủ can đảm để theo đuổi điều mình tin, đủ kiên trì khi đường khó đi và đủ yêu thương để chẳng ai phải một mình giữa những ngày chông chênh.",
      "Chúc tương lai của hai bạn rực rỡ như vườn hướng dương trong nắng sớm, nhưng dù nắng hay mưa, chỉ cần còn chung bước thì lòng vẫn luôn sáng.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến chúng mình thật nhiều năng lượng và hy vọng. Chúng mình sẽ cùng nhau bước tiếp bằng tất cả niềm tin.",
      "Lời chúc của bạn như một tia nắng ấm, đến đúng lúc và làm lòng vui hơn. Cảm ơn bạn thật nhiều!",
      "Mong một ngày gần đây chúng mình có thể kể bạn nghe những chuyến đi và ước mơ đã thành hình. Cảm ơn bạn đã chúc phúc.",
      "Cảm ơn bạn đã tiếp thêm động lực cho hành trình mới của hai đứa. Mong bạn cũng luôn gặp những ngày đầy nắng.",
      "Chúng mình sẽ cất lời chúc này trong tim, để những hôm mỏi mệt lại nhớ rằng phía trước còn nhiều điều đáng mong chờ.",
      "Cảm ơn bạn đã cùng chúng mình hướng về một tương lai tươi sáng. Có bạn sẻ chia, ngày vui càng thêm ý nghĩa.",
    ],
  },
  {
    id: "lavender",
    name: "Hoa lavender",
    theme: "Thấu hiểu và sẻ chia",
    plant: "lavender",
    message:
      "Oải hương mang sắc tím dịu trên những bông hoa nhỏ kết thành từng nhành dài, cùng hương thơm thoang thoảng rất riêng. Vẻ đẹp trầm lắng ấy khiến lavender thường được gắn với sự bình yên, lòng thủy chung và những ký ức dịu dàng còn vương lại theo năm tháng.",
    prompts: [
      "Chúc hai bạn nghe được cả những điều chưa kịp nói thành lời.",
      "Mong lòng bao dung luôn rộng hơn những giận hờn thoáng qua.",
      "Gửi lời chúc cho một mái nhà dịu êm, nơi ai cũng được là mình.",
    ],
    wishes: [
      "Chúc hai bạn luôn đủ kiên nhẫn để lắng nghe nhau đến cuối câu, đủ dịu dàng để hiểu điều nằm sau im lặng và đủ chân thành để nói ra điều lòng mình cất giữ.",
      "Mong mỗi khi mỏi mệt, cả hai đều tìm thấy nơi người kia một khoảng lặng an yên, nơi chẳng cần phải mạnh mẽ, chỉ cần được ngồi cạnh nhau cũng thấy nhẹ lòng.",
      "Chúc hai bạn cùng đi qua ngày vui bằng nụ cười, ngày khó bằng sự sẻ chia, để chẳng niềm hạnh phúc nào thiếu người chứng kiến và chẳng nỗi buồn nào phải tự mang.",
      "Mong những khác biệt không trở thành bức tường ngăn cách, mà là cánh cửa giúp hai bạn hiểu thêm một thế giới riêng và yêu nhau bằng tấm lòng rộng mở hơn.",
      "Chúc căn nhà của hai bạn luôn có chỗ cho lời tâm sự, cho những lần xin lỗi, cho cái ôm làm lành và cho sự bình yên được vun đắp từ hai phía.",
      "Mong hai bạn biết bao dung với những thiếu sót của nhau, cùng trưởng thành sau mỗi lần vấp váp và không quên rằng yêu cũng là học cách dịu dàng.",
      "Chúc tình yêu có đủ yên bình để nghỉ ngơi, đủ tin tưởng để đi xa và đủ thấu hiểu để dù ngoài kia đổi thay, hai người vẫn tìm thấy nhau.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến chúng mình lời chúc thật ấm. Chúng mình mong sẽ luôn biết lắng nghe và dịu dàng với nhau như thế.",
      "Lời chúc của bạn khiến lòng chúng mình nhẹ lại. Cảm ơn bạn đã dành thời gian và tình cảm cho hai đứa.",
      "Cảm ơn bạn đã nhắc chúng mình rằng thấu hiểu cũng là một cách yêu thương. Chúng mình sẽ luôn ghi nhớ điều ấy.",
      "Nhận được lời chúc này, chúng mình thấy ngày vui như lắng lại trong một khoảng bình yên. Cảm ơn bạn nhiều nhé!",
      "Chúng mình mong mái nhà sau này sẽ luôn là nơi được sẻ chia và chở che. Cảm ơn bạn đã chúc phúc cho hai đứa.",
      "Cảm ơn bạn đã góp thêm một điều dịu dàng vào ngày đặc biệt. Mong sự bình yên cũng luôn ở bên bạn.",
    ],
  },
  {
    id: "rose",
    name: "Hoa hồng",
    theme: "Tình yêu và lãng mạn",
    plant: "rose",
    message:
      "Hoa hồng quyến rũ bởi những lớp cánh mềm cuộn vào nhau, vừa mong manh vừa rực rỡ, như cất giữ một điều chưa nói giữa lòng hoa. Qua bao thế hệ, hoa hồng vẫn là biểu tượng quen thuộc của tình yêu và đam mê; mỗi sắc hoa lại mang một cung bậc riêng của những rung động trong lòng người.",
    prompts: [
      "Chúc tình yêu qua năm tháng vẫn ngọt ngào như buổi đầu gặp gỡ.",
      "Mong những điều lãng mạn nhỏ bé luôn tìm được chỗ trong ngày thường.",
      "Gửi hai bạn lời chúc nồng nàn, để thương yêu cứ thế đơm hoa.",
    ],
    wishes: [
      "Chúc hai bạn yêu nhau thật lâu, nắm tay thật chặt và đừng quên dành cho nhau những buổi hẹn hò, dù chỉ là một vòng dạo phố trong chiều muộn.",
      "Mong mỗi ngày bên nhau vẫn có một điều nhỏ bé khiến tim rung động, một lời khen bất chợt, một cái ôm thật lâu hay ánh mắt trìu mến giữa lúc bận rộn.",
      "Chúc sau ngày cưới, hai bạn vẫn biết làm người kia bất ngờ bằng món quà nhỏ, bữa tối tự tay chuẩn bị hay lời nhắn ngọt ngào giữa một ngày bình thường.",
      "Mong những cái ôm, lời hỏi han và nụ cười vẫn ở lại trong căn nhà, để tình yêu không chỉ là ký ức đẹp mà còn là điều được chăm chút mỗi ngày.",
      "Chúc tình yêu càng qua năm tháng càng thêm sâu, như hoa hồng nở qua mùa nắng gió, vẫn giữ hương thơm và vẻ đẹp riêng của những điều đã được nâng niu.",
      "Mong hai bạn luôn là ngoại lệ dịu dàng của nhau, là người khiến một ngày dài bỗng hóa nhẹ tênh và khiến những điều quen thuộc vẫn mang theo chút ngọt ngào.",
      "Chúc một đời thương nhau, hôm nay nhiều hơn hôm qua, ngày mai sâu hơn hôm nay; qua bao mùa hoa nở vẫn thấy lòng mình rung động khi người kia mỉm cười.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi chút ngọt ngào đến ngày vui của chúng mình. Chúng mình sẽ cố gắng giữ những rung động này qua thật nhiều năm tháng.",
      "Lời chúc lãng mạn quá, xin nhận cùng một cái ôm từ xa. Cảm ơn bạn đã làm ngày hôm nay thêm đáng nhớ!",
      "Mong sau này chúng mình vẫn có thật nhiều buổi hẹn hò và chuyện nhỏ để kể. Cảm ơn bạn đã chúc phúc cho hai đứa.",
      "Cảm ơn bạn đã gửi đến chúng mình một nhành thương mến. Mong tình yêu sẽ luôn nở hoa như điều bạn chúc.",
      "Chúng mình xin giữ lời chúc này như một lời nhắc rằng yêu thương cần được chăm chút mỗi ngày. Cảm ơn bạn thật nhiều.",
      "Cảm ơn bạn nha, mong bạn cũng luôn có người để thương, có niềm vui để đợi và có những ngày dịu dàng như hôm nay.",
    ],
  },
  {
    id: "calla-lily",
    name: "Hoa rum",
    theme: "Thanh lịch và khởi đầu mới",
    plant: "calla-lily",
    message:
      "Rum trắng gây ấn tượng bởi dáng hoa uốn cong thanh thoát, một cánh hoa lớn ôm lấy nhụy vàng như nét vẽ mềm trên nền xanh của lá. Không cần nhiều lớp cánh hay sắc màu cầu kỳ, loài hoa vẫn toát lên vẻ tinh giản, thanh lịch và thường gợi liên tưởng đến sự thuần khiết, cao quý.",
    prompts: [
      "Chúc chương mới mở ra thật êm đềm, nhiều cơ hội và đầy niềm vui.",
      "Mong mỗi bước chân chung đều đưa hai bạn đến gần hơn với ước mơ.",
      "Gửi lời chúc cho khởi đầu đẹp và một hành trình dài thật đáng nhớ.",
    ],
    wishes: [
      "Chúc hai bạn bước vào cuộc sống hôn nhân với trái tim rộng mở, lòng tin vững vàng và niềm háo hức dành cho những điều tốt đẹp còn đang đợi phía trước.",
      "Mong chương mới này có những chuyến đi bất ngờ, những giấc mơ chung dần thành hiện thực và những ngày bình thường cũng trở thành kỷ niệm đáng nâng niu.",
      "Chúc hai bạn luôn đủ bình tĩnh để cùng nhau chọn hướng đi, đủ tin tưởng để chia sẻ những điều quan trọng và đủ yêu thương để quyết định nào cũng có chỗ cho cả hai.",
      "Mong mỗi bước ngoặt của cuộc đời đều mở ra một cánh cửa mới, đưa hai bạn gần hơn với cuộc sống mình mong muốn và giúp tình yêu thêm vững vàng qua trải nghiệm.",
      "Chúc mái nhà mới luôn thuận hòa, có tiếng cười trong gian bếp, có ánh đèn đợi nhau trở về và có một tình yêu đủ rộng để chở che mọi đổi thay.",
      "Mong hành trình sắp tới đem đến nhiều cơ hội, may mắn và những người tốt lành; trên mỗi chặng đường, hai bạn vẫn luôn có nhau làm bạn đồng hành.",
      "Chúc hai bạn viết nên câu chuyện hôn nhân theo cách riêng, không cần giống bất kỳ ai, chỉ cần chân thành, bền bỉ và mỗi ngày đều thấy vui vì đã chọn nhau.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho khởi đầu của chúng mình thật tốt đẹp. Chúng mình sẽ cùng nhau viết tiếp những trang đời còn ở phía trước.",
      "Lời chúc của bạn khiến ngày hôm nay thêm nhiều hy vọng. Cảm ơn bạn đã cùng chúng mình đánh dấu khoảnh khắc đặc biệt này.",
      "Chúng mình cũng đang háo hức chờ những điều mới mẻ phía trước. Cảm ơn bạn đã gửi đến hai đứa thật nhiều yêu thương.",
      "Cảm ơn bạn đã dành lời chúc cho chương mới của chúng mình. Mong những điều tốt lành sẽ ghé thăm bạn trên mọi nẻo đường.",
      "Lời chúc này sẽ là một kỷ niệm đẹp trong ngày cưới. Chúng mình xin nhận bằng tất cả sự trân trọng.",
      "Cảm ơn bạn đã hiện diện trong niềm vui hôm nay, dù bằng một lời chúc từ xa. Tình cảm ấy thật đáng quý với chúng mình.",
    ],
  },
  {
    id: "lotus",
    name: "Hoa sen",
    theme: "An nhiên và bền vững",
    plant: "lotus",
    message:
      "Hoa sen vươn lên từ mặt nước, những lớp cánh hồng hoặc trắng xếp quanh nhụy vàng, thanh sạch và tĩnh tại giữa sắc xanh của lá. Trong văn hóa Việt Nam, sen là biểu tượng của sự thuần khiết, phẩm giá và sức sống bền bỉ — vẻ đẹp vẫn giữ được nét trong lành dù đi qua bùn sâu.",
    prompts: [
      "Chúc hai bạn giữ lòng an nhiên giữa những đổi thay của cuộc đời.",
      "Mong sự bao dung luôn nở hoa trong mái nhà chung của hai người.",
      "Gửi lời chúc cho một tình yêu vững vàng, lặng lẽ mà sâu xa.",
    ],
    wishes: [
      "Chúc hai bạn có cuộc sống bình yên, ít muộn phiền, nhiều tiếng cười và luôn nhớ rằng đôi khi hạnh phúc lớn nhất là được ngồi cạnh nhau sau một ngày dài.",
      "Mong dù cuộc đời có đổi thay, hai bạn vẫn giữ được niềm tin, sự dịu dàng và lòng trân trọng dành cho nhau như mặt hồ yên vẫn soi bóng đóa sen.",
      "Chúc hai bạn đủ bao dung để bỏ qua những điều nhỏ nhặt, đủ chân thành để nói ra điều khó nói và đủ yêu thương để cùng nhau tìm lối đi mỗi khi bất đồng.",
      "Mong ngôi nhà luôn có hơi ấm, lời nói luôn có sự tử tế và mỗi người đều cảm thấy an toàn khi được trở về bên người mình thương.",
      "Chúc hai bạn biết chậm lại giữa những ngày vội vã, cùng uống một tách trà, ngắm một chiều trôi và nhận ra niềm vui vẫn ở ngay bên cạnh mình.",
      "Mong tình yêu ngày càng vững vàng mà chẳng cần ồn ào, sâu sắc mà không phô trương, như đóa sen lặng lẽ tỏa hương giữa khoảng trời thanh tĩnh.",
      "Chúc hai bạn cùng sống một đời bình dị mà đáng quý, biết ơn những gì đang có và vẫn nắm tay nhau thật chặt khi con đường phía trước đổi thay.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho chúng mình một cuộc sống an nhiên. Chúng mình sẽ cố gắng giữ sự dịu dàng ấy trong từng ngày chung đôi.",
      "Lời chúc thật nhẹ nhàng mà sâu sắc, chúng mình xin cất giữ như một điều lành trong ngày cưới.",
      "Cảm ơn bạn đã nhắc chúng mình về lòng bao dung và sự trân trọng. Đó sẽ là những điều hai đứa luôn học cách gìn giữ.",
      "Mong những ngày sau này đều có chút bình yên như lời bạn gửi. Cảm ơn bạn đã dành tình cảm cho chúng mình.",
      "Chúng mình xin nhận lời chúc này bằng tất cả sự biết ơn. Mong bạn cũng luôn tìm thấy bình yên trên hành trình của mình.",
      "Cảm ơn bạn đã mang đến ngày vui một lời chúc thật trong trẻo. Chúng mình sẽ nhớ mãi sự ấm áp này.",
    ],
  },
  {
    id: "cherry-blossom",
    name: "Hoa anh đào",
    theme: "Khởi đầu và trân trọng hiện tại",
    plant: "cherry-blossom",
    message:
      "Hoa anh đào nở thành từng chùm mỏng nhẹ, sắc hồng phớt phủ lên cành cây như làn mây nhỏ giữa trời xuân. Mùa hoa đến rồi đi trong khoảng thời gian ngắn ngủi, khiến loài hoa trở thành biểu tượng của vẻ đẹp mong manh, sự khởi đầu mới và lời nhắc dịu dàng về những khoảnh khắc đáng nâng niu.",
    prompts: [
      "Chúc hai bạn trân quý hôm nay và cùng nhau mong đợi những mùa sau.",
      "Mong mỗi năm đi qua đều để lại một miền ký ức đẹp trong tim.",
      "Gửi lời chúc cho những khoảnh khắc nhỏ hóa thành kỷ niệm dài lâu.",
    ],
    wishes: [
      "Chúc hai bạn gom góp thật nhiều kỷ niệm trên hành trình chung, từ chuyến đi xa đầu tiên đến những chiều ở nhà chẳng làm gì, mà sau này nhớ lại vẫn mỉm cười.",
      "Mong mỗi mùa trong cuộc đời đều mang đến điều mới mẻ, khi nắng đẹp thì cùng nhau đi xa, lúc mưa về thì ngồi gần lại và kể nhau nghe những chuyện thân quen.",
      "Chúc hai bạn luôn biết tận hưởng điều đang có, không mải đợi ngày mai mà quên mất hôm nay cũng đang nở hoa ngay trong căn nhà nhỏ.",
      "Mong mỗi lần kỷ niệm ngày cưới, hai bạn lại có thêm một câu chuyện để kể, một điều để biết ơn và một lý do mới để yêu người bên cạnh.",
      "Chúc hành trình chung có nhiều chuyến đi, những lần khám phá và khoảnh khắc bất ngờ; mỗi nơi từng đến đều lưu lại dấu chân của hai người cùng bước.",
      "Mong sau nhiều năm, hai bạn vẫn nhìn thấy những điều đẹp đẽ ở nhau, vẫn biết ngạc nhiên trước một nét quen thuộc và vẫn nâng niu nhau như ngày đầu gặp gỡ.",
      "Chúc từng ngày bên nhau trở thành một cánh hoa trong câu chuyện tình yêu, để khi ngoảnh lại, cả hai thấy mình đã có một mùa đời thật đẹp.",
    ],
    replies: [
      "Cảm ơn bạn đã góp thêm một cánh hoa kỷ niệm vào ngày hôm nay. Chúng mình mong sẽ còn nhiều mùa đẹp được cùng nhau đi qua.",
      "Lời chúc của bạn thật dịu dàng. Chúng mình sẽ cố gắng trân trọng nhiều hơn những khoảnh khắc bình thường ở cạnh nhau.",
      "Cảm ơn bạn đã gửi lời chúc cho hành trình sắp tới của hai đứa. Mong chúng mình sẽ có thật nhiều chuyện đẹp để kể lại.",
      "Chúng mình xin cất lời chúc này vào miền ký ức của ngày cưới. Cảm ơn bạn đã cùng làm khoảnh khắc này đáng nhớ.",
      "Mong những năm tháng phía trước sẽ đầy ắp kỷ niệm đẹp như điều bạn gửi gắm. Cảm ơn bạn thật nhiều!",
      "Cảm ơn bạn đã dành cho chúng mình một lời chúc nhiều thương mến. Mong khi gặp lại, ta lại có thêm chuyện vui để sẻ chia.",
    ],
  },
  {
    id: "orchid",
    name: "Hoa lan",
    theme: "Tinh tế và bền bỉ",
    plant: "orchid",
    message:
      "Phong lan có dáng hoa thanh thoát, những cánh hoa cân đối mở ra với đường nét tinh xảo và sắc màu phong phú. Không phô trương mà vẫn đầy cuốn hút, phong lan từ lâu gắn với vẻ đẹp quý phái, sự tinh tế và nét duyên bền bỉ vượt qua những mùa nở tàn.",
    prompts: [
      "Chúc hai bạn càng đi lâu càng hiểu, càng hiểu càng trân trọng nhau.",
      "Mong mỗi người được là chính mình mà vẫn có người đồng hành bên cạnh.",
      "Gửi lời chúc cho một tình yêu trưởng thành, tinh tế và dài lâu.",
    ],
    wishes: [
      "Chúc hai bạn luôn nhìn thấy những điều đáng quý ở nhau, kể cả những nét bình thường ít ai để ý, và đừng quên nói ra sự trân trọng trước khi ngày tháng trôi qua.",
      "Mong tình yêu trưởng thành qua từng thử thách, không vì khó khăn mà phai nhạt, trái lại càng hiểu rõ điều gì đáng giữ gìn và càng biết cách nắm tay nhau.",
      "Chúc hai bạn luôn dành cho nhau sự tôn trọng, niềm tin và lòng ngưỡng mộ, để bên cạnh tình yêu còn có tình bạn đẹp cùng sự đồng hành vững chãi.",
      "Mong mỗi người được theo đuổi con đường riêng, nuôi dưỡng những ước mơ của mình mà vẫn biết rằng phía sau luôn có một người lặng lẽ cổ vũ và sẻ chia.",
      "Chúc hai bạn cùng xây dựng cuộc sống nhiều trải nghiệm, có những cuộc trò chuyện sâu, những chuyến đi xa và những khoảng lặng đủ yên để hiểu nhau hơn.",
      "Mong hai bạn tinh tế nhận ra những nỗ lực nhỏ của nhau, một việc làm âm thầm, một lần nhường nhịn, một câu hỏi han đúng lúc cũng đủ làm lòng ấm lên.",
      "Chúc tình yêu không cần hoàn hảo như tranh, chỉ cần chân thành như lời hứa, bền bỉ như hoa lan và đủ dịu dàng để cùng nhau đi hết những mùa đời.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi lời chúc thật sâu sắc. Chúng mình sẽ cùng nhau học cách thấu hiểu và trân trọng nhau hơn mỗi ngày.",
      "Lời chúc này khiến ngày đặc biệt thêm ý nghĩa. Cảm ơn bạn đã dành cho hai đứa những điều chân thành như thế.",
      "Chúng mình mong sẽ luôn có thể tự hào về nhau, không chỉ vì những thành tựu mà còn vì cách cả hai cùng trưởng thành.",
      "Cảm ơn bạn đã chúc phúc cho tình yêu của chúng mình. Mong những năm tháng tới sẽ giúp hai đứa hiểu nhau thêm nhiều nữa.",
      "Chúng mình xin giữ lời chúc này như một lời nhắc dịu dàng về sự tôn trọng và tin tưởng. Cảm ơn bạn thật nhiều.",
      "Cảm ơn bạn đã quan tâm đến hành trình mới của hai đứa. Mong tình yêu và những điều tốt lành cũng luôn ở bên bạn.",
    ],
  },
  {
    id: "carnation",
    name: "Hoa cẩm chướng",
    theme: "Quan tâm và gắn bó",
    plant: "carnation",
    message:
      "Cẩm chướng mang những cánh hoa viền lượn mềm mại, xếp dày thành đóa nhỏ xinh với sắc hồng, đỏ, trắng hay kem dịu mắt. Loài hoa thường gắn với lòng biết ơn, sự trìu mến và tình cảm bền lâu — những điều đôi khi không cần nói thành lời vẫn đủ sức chạm đến trái tim.",
    prompts: [
      "Chúc hai bạn luôn nhớ hỏi han nhau giữa những ngày bận rộn.",
      "Mong yêu thương hiện diện trong từng việc nhỏ, chẳng cần nói thành lời.",
      "Gửi lời chúc cho một mái nhà được vun vén bằng sự quan tâm mỗi ngày.",
    ],
    wishes: [
      "Chúc hai bạn luôn nhớ hỏi nhau một câu hôm nay có mệt không, có chuyện gì vui buồn không, bởi đôi khi yêu thương bắt đầu từ việc thật lòng muốn biết người kia thế nào.",
      "Mong tình yêu hiện diện trong những việc nhỏ mỗi ngày, từ ly nước đặt bên bàn, bữa cơm được chờ sẵn đến chiếc áo khoác trao nhau khi trời trở gió.",
      "Chúc hai bạn biết chia sẻ việc nhà, san bớt áp lực và cùng chăm chút cho mái ấm, để trách nhiệm không trở thành gánh nặng của riêng một người.",
      "Mong dù lịch trình có dày đến đâu, hai bạn vẫn dành cho nhau một khoảng thời gian trọn vẹn, nơi điện thoại được đặt xuống và câu chuyện được lắng nghe đến cùng.",
      "Chúc hai bạn luôn là người đầu tiên muốn kể chuyện vui và cũng là người tìm đến khi lòng chùng xuống, cùng nhau đón niềm vui và san sẻ những điều khó nói.",
      "Mong sự quan tâm chân thành cứ lớn dần theo năm tháng, không ồn ào mà bền bỉ, để mỗi người luôn cảm nhận được mình được nhớ đến và yêu thương.",
      "Chúc hai bạn thương nhau bằng cả lời nói lẫn hành động, bằng sự có mặt đúng lúc và những điều giản dị được lặp lại mỗi ngày bằng một tấm lòng không đổi.",
    ],
    replies: [
      "Cảm ơn bạn đã nhắc chúng mình về những điều nhỏ bé mà quý giá. Chúng mình sẽ cố gắng quan tâm nhau nhiều hơn qua từng ngày.",
      "Lời chúc thật gần gũi và ấm áp, như một lời nhắc về cách yêu thương bằng hành động. Cảm ơn bạn nhé!",
      "Chúng mình mong mái nhà sau này luôn có những điều bình dị ấy. Cảm ơn bạn đã gửi đến hai đứa nhiều tình cảm.",
      "Cảm ơn bạn đã dành lời chúc chân thành cho hai đứa. Mong chúng mình luôn nhớ hỏi han, sẻ chia và đỡ đần nhau.",
      "Lời chúc đáng yêu quá, chúng mình xin nhận với thật nhiều biết ơn. Mong bạn cũng luôn được quan tâm và yêu thương.",
      "Cảm ơn bạn đã góp một điều ấm áp vào ngày vui này. Chúng mình sẽ cùng nhau gìn giữ những điều bình thường mà quý giá.",
    ],
  },
  {
    id: "hydrangea",
    name: "Hoa cẩm tú cầu",
    theme: "Biết ơn và thấu hiểu",
    plant: "hydrangea",
    message:
      "Cẩm tú cầu kết từ vô vàn bông hoa nhỏ, tụ lại thành khối tròn đầy như một đám mây mềm trên nền lá xanh. Sắc hoa có thể chuyển từ xanh sang hồng, tím tùy giống và điều kiện đất, tạo nên vẻ đẹp biến chuyển đầy thi vị; loài hoa cũng thường tượng trưng cho lòng biết ơn và những cảm xúc chân thành.",
    prompts: [
      "Chúc hai bạn luôn lắng nghe bằng trái tim và đáp lời bằng sự tôn trọng.",
      "Mong lời cảm ơn, lời xin lỗi luôn được nói ra đúng lúc, thật lòng.",
      "Gửi lời chúc để khác biệt hóa thành thấu hiểu, chứ không thành xa cách.",
    ],
    wishes: [
      "Chúc hai bạn biết lắng nghe bằng sự chân thành, nói với nhau bằng lòng tôn trọng và luôn dành đủ thời gian để hiểu điều người kia thực sự muốn gửi gắm.",
      "Mong mỗi lần bất đồng không trở thành một khoảng cách, mà là dịp để hai bạn hiểu thêm về nhau, học cách nhìn từ một phía khác và tìm được tiếng nói chung.",
      "Chúc hai bạn luôn biết nói lời cảm ơn khi được quan tâm, lời xin lỗi khi làm nhau buồn và lời yêu thương ngay cả khi nghĩ rằng người kia đã hiểu lòng mình.",
      "Mong những khác biệt làm cuộc sống chung thêm phong phú, như nhiều cánh hoa cùng tạo nên một đóa tròn đầy, chứ không khiến hai người dần bước về hai phía xa nhau.",
      "Chúc hai bạn trân trọng sự hiện diện của nhau cả trong những ngày chẳng có gì đặc biệt, bởi một người vẫn ở bên qua bao điều nhỏ nhặt đã là món quà rất quý.",
      "Mong tình yêu ngày càng sâu sắc nhờ cảm thông và biết ơn, để cả hai không xem sự hy sinh là điều hiển nhiên mà luôn nhìn thấy tấm lòng phía sau.",
      "Chúc hai bạn có thể thành thật với nhau, cùng ngồi lại khi có chuyện chưa ổn và luôn tin rằng điều cần giải quyết là vấn đề trước mắt, không phải tình yêu dành cho nhau.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi một lời chúc thật tinh tế. Chúng mình sẽ nhớ rằng lắng nghe và biết ơn cũng là những cách yêu thương.",
      "Lời chúc này rất ý nghĩa, chúng mình xin cất giữ như một điều đẹp đẽ trong ngày cưới. Cảm ơn bạn nhiều nhé!",
      "Chúng mình mong sẽ ngày càng thấu hiểu nhau hơn, cả trong lời nói lẫn những điều còn ngập ngừng. Cảm ơn bạn đã chúc phúc.",
      "Cảm ơn bạn đã nhắc đến những điều quan trọng để giữ một mái nhà ấm áp. Chúng mình sẽ cùng nhau vun đắp từng ngày.",
      "Chúng mình xin nhận lời chúc và gửi lại bạn thật nhiều thương mến. Mong sự thấu hiểu luôn đồng hành cùng bạn.",
      "Cảm ơn bạn đã làm ngày vui của hai đứa thêm ý nghĩa bằng những lời chân thành này.",
    ],
  },
  {
    id: "magnolia",
    name: "Hoa mộc lan",
    theme: "Trưởng thành và khởi sắc",
    plant: "magnolia",
    message:
      "Mộc lan nở những đóa hoa lớn với cánh dày, mượt mà, đường nét thanh nhã và hương thơm nhẹ nhàng. Vẻ đẹp vừa mạnh mẽ vừa tinh tế khiến loài hoa thường được gắn với phẩm giá, sự cao quý và sức sống bền bỉ, như nét đẹp lặng thầm mà không dễ phai mờ.",
    prompts: [
      "Chúc hai bạn cùng trưởng thành mà vẫn giữ nguyên những điều làm mình đặc biệt.",
      "Mong ước mơ riêng được tôn trọng, ước mơ chung được cùng nhau vun trồng.",
      "Gửi lời chúc cho những mùa sau ngày một khởi sắc và đầy hy vọng.",
    ],
    wishes: [
      "Chúc hai bạn cùng trưởng thành qua từng chặng đường, biết mừng cho thành công của nhau, học từ những lần vấp ngã và luôn tự hào về hành trình riêng của mỗi người.",
      "Mong cả hai được theo đuổi điều mình yêu thích, có người đứng bên cổ vũ khi bắt đầu và có vòng tay chờ đón khi cần nghỉ lại sau một ngày dài.",
      "Chúc những mục tiêu chung lần lượt thành hiện thực nhờ sự kiên trì, những cuộc trò chuyện thẳng thắn và niềm tin rằng hai người có thể cùng nhau làm nên điều tốt đẹp.",
      "Mong cuộc sống hôn nhân mở ra nhiều cơ hội mới, những trải nghiệm khiến lòng rộng mở và những bài học giúp hai bạn hiểu bản thân cũng như người bên cạnh sâu sắc hơn.",
      "Chúc hai bạn luôn động viên nhau khi bắt đầu điều mới, kiên nhẫn khi mọi chuyện chưa như ý và biết rằng có những thành quả cần thời gian để âm thầm đơm nụ.",
      "Mong nhiều năm sau nhìn lại, hai bạn sẽ thấy mình đã đi được thật xa, đã cùng nhau vượt qua nhiều điều và vẫn giữ được ánh mắt tự hào dành cho nhau.",
      "Chúc mỗi bước tiến của một người đều trở thành niềm vui của người còn lại, để thành công không chỉ thuộc về riêng ai mà là một mùa hoa nở trong mái nhà chung.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho hành trình trưởng thành của chúng mình. Chúng mình sẽ luôn cổ vũ và vun đắp cho những ước mơ của nhau.",
      "Lời chúc của bạn đầy hy vọng, như một lời động viên cho chặng đường dài phía trước. Cảm ơn bạn thật nhiều!",
      "Mong những năm tới sẽ mang đến thật nhiều điều tốt đẹp như bạn gửi gắm. Chúng mình xin nhận lời chúc bằng tất cả sự trân trọng.",
      "Cảm ơn bạn đã tin tưởng và chúc phúc cho tương lai của hai đứa. Chúng mình sẽ cùng nhau cố gắng từng ngày.",
      "Chúng mình sẽ nhớ lời chúc này mỗi khi bắt đầu một điều mới. Cảm ơn bạn đã tiếp thêm niềm tin cho hai đứa.",
      "Cảm ơn bạn đã dành sự quan tâm cho hành trình mới của chúng mình. Mong bạn cũng luôn có những mùa đời khởi sắc.",
    ],
  },
  {
    id: "cosmos",
    name: "Hoa cánh bướm",
    theme: "Tự do và niềm vui",
    plant: "cosmos",
    message:
      "Cánh bướm — cosmos — có những cánh hoa mảnh xòe rộng quanh nhụy vàng, rung rinh nhẹ nhàng trên thân cây thanh mảnh. Vẻ đẹp tự nhiên, phóng khoáng của loài hoa gợi lên sự hài hòa, nét hồn nhiên và niềm vui tự do, như một khoảng trời trong trẻo giữa khu vườn đầy nắng.",
    prompts: [
      "Chúc hai bạn luôn là chính mình và vẫn vui lòng đi cùng nhau thật xa.",
      "Mong cuộc sống chung đầy tiếng cười, những ý tưởng bất chợt và chuyến đi vui.",
      "Gửi lời chúc cho tình yêu nhiều sắc màu, tự do mà vẫn gắn bó.",
    ],
    wishes: [
      "Chúc hai bạn luôn vui vẻ và thoải mái khi ở bên nhau, có thể nói những điều ngốc nghếch, cười vì chuyện nhỏ và cùng tạo nên những kỷ niệm chẳng giống ai.",
      "Mong mỗi người vẫn có khoảng trời riêng để theo đuổi sở thích, gặp gỡ bạn bè và nuôi dưỡng đam mê, rồi trở về kể người kia nghe bằng ánh mắt háo hức.",
      "Chúc hai bạn không ngại khám phá những điều mới mẻ, thử một món ăn lạ, ghé một miền đất xa hay bất chợt lên đường chỉ vì muốn có thêm chuyện vui để nhớ.",
      "Mong hôn nhân không chỉ có trách nhiệm và những kế hoạch dài lâu, mà còn có sự tinh nghịch, những lần trêu đùa và niềm vui tự nhiên của hai người bạn thân.",
      "Chúc hai bạn tôn trọng cá tính của nhau, không cần giống nhau trong mọi điều mà vẫn biết tìm thấy điểm chung để cùng cười, cùng mơ và cùng đi tiếp.",
      "Mong những ngày bình thường cũng đầy màu sắc nhờ những ý tưởng bất chợt, một buổi picnic không báo trước hay một tối cùng nhau làm điều chưa từng thử.",
      "Chúc hai bạn vừa là một gia đình vững vàng, vừa là đôi bạn thân luôn muốn kể nhau nghe mọi chuyện, cùng giữ lòng tự do và tình thương qua bao năm tháng.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến hai đứa một lời chúc đầy màu sắc. Chúng mình sẽ cố gắng tận hưởng từng ngày và cười với nhau thật nhiều.",
      "Lời chúc nhiều năng lượng quá, đọc mà thấy vui lây. Cảm ơn bạn đã làm ngày cưới thêm rộn ràng!",
      "Mong chúng mình sẽ có thật nhiều chuyến đi và trải nghiệm để sau này kể lại. Cảm ơn bạn đã chúc phúc cho hai đứa.",
      "Cảm ơn bạn đã chúc cho cuộc sống chung của chúng mình luôn nhiều màu sắc. Chúng mình xin nhận bằng một nụ cười thật tươi!",
      "Chúng mình xin nhận lời chúc đáng yêu này, hứa sẽ luôn dành chỗ cho tiếng cười và những điều bất ngờ trong mái nhà nhỏ.",
      "Cảm ơn bạn đã mang thêm niềm vui đến ngày hôm nay. Mong cuộc sống của bạn cũng đầy những cuộc hẹn vui và người thương quý.",
    ],
  },
];
