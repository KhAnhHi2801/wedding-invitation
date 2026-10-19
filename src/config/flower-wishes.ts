/**
 * Nội dung lời chúc theo từng loài hoa của mini-game "gieo một lời chúc". Đổi chữ ở đây là đổi trang.
 * `id` khớp `src/config/flower-botanical.ts` (hình dáng, màu, thời lượng nở) và `FLOWER_IDS` trong `apps-script/wishes.gs`.
 */
export interface FlowerWish {
  id: string
  name: string
  /** Chủ đề ngắn hiện dưới tên hoa */
  theme: string
  plant: string
  /** Câu hiện khi hạt nảy mầm */
  message: string
  /** Gợi ý luân phiên làm placeholder ô lời chúc */
  prompts: string[]
  /** Lời chúc mẫu điền sẵn (khách sửa tự do) */
  wishes: string[]
  /** Lời cảm ơn hiện sau khi gửi */
  replies: string[]
}

export const flowerWishes: FlowerWish[] = [
  {
    id: "baby-breath",
    name: "Hoa baby",
    theme: "Bình yên và bền lâu",
    plant: "baby-breath",
    message: "Một tình yêu đẹp đôi khi bắt đầu từ những điều giản dị nhất.",
    prompts: [
      "Chúc hai bạn luôn tìm thấy bình yên khi ở bên nhau.",
      "Mong ngôi nhà nhỏ lúc nào cũng đầy ắp tiếng cười.",
      "Gửi hai bạn một lời chúc cho hành trình dài phía trước.",
    ],
    wishes: [
      "Chúc hai bạn bên nhau thật lâu, cùng nhau đi qua những năm tháng thật đẹp.",
      "Mong cuộc sống hôn nhân của hai bạn luôn bình yên, ấm áp và ngập tràn tiếng cười.",
      "Chúc cho những điều giản dị mỗi ngày cũng đủ khiến hai bạn cảm thấy hạnh phúc.",
      "Mong dù sau này cuộc sống có bận rộn đến đâu, hai bạn vẫn luôn dành thời gian cho nhau.",
      "Chúc hai bạn luôn là nơi bình yên nhất để người kia trở về.",
      "Trăm năm hạnh phúc, đầu bạc răng long nhé!",
      "Chúc gia đình nhỏ luôn đầy ắp yêu thương và những điều tốt lành.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi một lời chúc thật dịu dàng đến chúng mình!",
      "Chúng mình sẽ giữ lời chúc này như một điều thật đẹp trong ngày cưới.",
      "Mong một ngày nào đó, chúng mình có thể kể lại thật nhiều chuyện vui bên nhau.",
      "Cảm ơn bạn đã góp thêm một chút ấm áp cho ngày đặc biệt này.",
      "Nhận được lời chúc của bạn, ngày vui của chúng mình càng trọn vẹn hơn.",
      "Một lời chúc nhỏ, niềm vui lớn. Cảm ơn bạn thật nhiều!",
    ],
  },
  {
    id: "peony",
    name: "Hoa mẫu đơn",
    theme: "Hạnh phúc viên mãn",
    plant: "peony",
    message:
      "Mong những điều tốt đẹp nhất sẽ luôn nở rộ trong mái ấm của hai bạn.",
    prompts: [
      "Chúc hai bạn có một cuộc sống đủ đầy và viên mãn.",
      "Mong mọi dự định chung đều thành hiện thực.",
      "Gửi hai bạn lời chúc về một mái ấm thật sung túc.",
    ],
    wishes: [
      "Chúc hai bạn hôn nhân viên mãn, công việc thuận lợi và lúc nào cũng yêu đời.",
      "Mong gia đình nhỏ của hai bạn luôn đủ đầy cả vật chất lẫn tình yêu thương.",
      "Chúc hai bạn cùng nhau xây dựng một mái ấm như ý, mỗi năm lại có thêm nhiều niềm vui.",
      "Mong mọi điều tốt lành sẽ lần lượt gõ cửa nhà hai bạn.",
      "Chúc tình yêu ngày càng đong đầy, cuộc sống ngày càng khởi sắc.",
      "Chúc hai bạn sớm hoàn thành mọi mục tiêu và có thật nhiều chuyến đi đáng nhớ cùng nhau.",
      "Mong hai bạn luôn có nhau trong những ngày thành công và cả lúc cần một bờ vai.",
    ],
    replies: [
      "Cảm ơn bạn! Chúng mình cũng mong những điều tốt đẹp sẽ đến với gia đình nhỏ.",
      "Lời chúc dễ thương quá, xin nhận thật nhiều may mắn từ bạn!",
      "Cảm ơn bạn đã chúc phúc cho khởi đầu mới của chúng mình.",
      "Mong niềm vui hôm nay sẽ còn theo chúng mình thật lâu. Cảm ơn bạn nhé!",
      "Có thêm lời chúc của bạn, chúng mình càng háo hức cho hành trình phía trước.",
      "Cảm ơn bạn đã gửi đến chúng mình những điều tốt lành!",
    ],
  },
  {
    id: "daisy",
    name: "Cúc họa mi",
    theme: "Niềm vui giản dị",
    plant: "daisy",
    message:
      "Hạnh phúc đôi khi chỉ là cùng nhau ăn một bữa cơm và kể chuyện mỗi ngày.",
    prompts: [
      "Chúc hai bạn luôn cười thật nhiều bên nhau.",
      "Mong những ngày bình thường cũng trở nên đáng nhớ.",
      "Hãy gửi một lời chúc thật vui cho cặp đôi nhé.",
    ],
    wishes: [
      "Chúc hai bạn ngày nào cũng có chuyện vui để kể cho nhau nghe.",
      "Mong sau đám cưới, hai bạn vẫn luôn hẹn hò, vẫn thích trêu nhau và vẫn cười như thuở đầu.",
      "Chúc cuộc sống chung có thật nhiều bữa ăn ngon, những chuyến đi vui và những buổi tối bình yên.",
      "Mong hai bạn luôn tìm thấy niềm vui từ những điều nhỏ nhất.",
      "Chúc hai bạn cãi nhau ít thôi, làm hòa nhanh và thương nhau nhiều hơn mỗi ngày.",
      "Mong nhà lúc nào cũng rộn ràng tiếng cười và thơm mùi đồ ăn ngon.",
      "Chúc hai bạn sống với nhau thật vui, thật thoải mái và thật hạnh phúc.",
    ],
    replies: [
      "Cảm ơn bạn nha! Chúng mình sẽ cố gắng cười thật nhiều mỗi ngày.",
      "Đọc lời chúc mà thấy vui lây luôn. Cảm ơn bạn nhé!",
      "Nhất định sẽ có thật nhiều bữa ăn ngon và chuyện vui để kể!",
      "Cảm ơn bạn đã làm ngày cưới của chúng mình vui hơn một chút.",
      "Lời chúc đáng yêu quá, chúng mình xin nhận!",
      "Mong sớm có dịp gặp bạn để cùng chia sẻ những niềm vui này.",
    ],
  },
  {
    id: "tulip",
    name: "Hoa tulip",
    theme: "Tình yêu chân thành",
    plant: "tulip",
    message:
      "Mong hai bạn vẫn luôn chọn nhau, kể cả khi cuộc sống không phải lúc nào cũng dễ dàng.",
    prompts: [
      "Chúc tình yêu của hai bạn luôn bền chặt.",
      "Mong hai bạn luôn lắng nghe và tôn trọng nhau.",
      "Gửi một lời chúc dành riêng cho tình yêu của hai bạn.",
    ],
    wishes: [
      "Chúc hai bạn luôn yêu nhau bằng sự chân thành, không chỉ bằng những lời nói ngọt ngào.",
      "Mong sau nhiều năm, hai bạn vẫn nhìn nhau bằng ánh mắt trìu mến như hôm nay.",
      "Chúc hai bạn luôn biết lắng nghe, thấu hiểu và nắm tay nhau qua mọi chặng đường.",
      "Mong tình yêu của hai bạn ngày càng sâu đậm qua từng năm tháng.",
      "Chúc hai bạn luôn là người yêu, người bạn thân và người đồng hành tuyệt vời nhất của nhau.",
      "Mong hai bạn luôn nhớ lý do mình bắt đầu và cùng nhau viết tiếp một câu chuyện thật đẹp.",
      "Chúc cho lời hứa hôm nay luôn được giữ bằng những hành động yêu thương mỗi ngày.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến chúng mình một lời chúc thật ý nghĩa.",
      "Chúng mình sẽ luôn cố gắng yêu thương và thấu hiểu nhau. Cảm ơn bạn nhé!",
      "Lời chúc này sẽ là một kỷ niệm đẹp trong ngày đặc biệt của chúng mình.",
      "Cảm ơn bạn đã tin vào tình yêu và chúc phúc cho hai đứa.",
      "Mong chúng mình sẽ cùng nhau giữ gìn những điều đẹp đẽ này thật lâu.",
      "Cảm ơn bạn thật nhiều vì đã đồng hành cùng niềm vui của chúng mình!",
    ],
  },
  {
    id: "sunflower",
    name: "Hoa hướng dương",
    theme: "Lạc quan và đồng hành",
    plant: "sunflower",
    message:
      "Mong hai bạn luôn cùng nhìn về phía trước, ngay cả trong những ngày nhiều mây.",
    prompts: [
      "Chúc hai bạn luôn tiếp thêm động lực cho nhau.",
      "Mong những ước mơ chung đều có ngày thành hiện thực.",
      "Gửi một lời chúc cho hành trình tương lai của hai bạn.",
    ],
    wishes: [
      "Chúc hai bạn luôn giữ được sự lạc quan và cùng nhau vượt qua mọi thử thách.",
      "Mong mỗi ngày đều mang đến một lý do để hai bạn tự hào về nhau.",
      "Chúc những kế hoạch còn dang dở sẽ sớm thành hiện thực khi hai bạn cùng cố gắng.",
      "Mong hai bạn sẽ đi được thật nhiều nơi, khám phá thật nhiều điều và có thật nhiều kỷ niệm đẹp.",
      "Chúc dù công việc có bận rộn, hai bạn vẫn luôn là nguồn động viên lớn nhất của nhau.",
      "Mong cả hai luôn đủ can đảm để theo đuổi ước mơ và đủ yêu thương để không ai phải đi một mình.",
      "Chúc tương lai của hai bạn rực rỡ như những đóa hướng dương dưới nắng.",
    ],
    replies: [
      "Cảm ơn bạn! Chúng mình sẽ cùng nhau cố gắng thật nhiều.",
      "Nhận lời chúc này, chúng mình có thêm động lực cho chặng đường phía trước rồi!",
      "Mong một ngày có thể kể cho bạn nghe thật nhiều thành quả và kỷ niệm đẹp.",
      "Cảm ơn bạn đã tiếp thêm năng lượng tích cực cho chúng mình.",
      "Chúng mình sẽ nhớ lời chúc này mỗi khi cần thêm động lực. Cảm ơn bạn nhé!",
      "Cảm ơn bạn đã cùng chúng mình hướng đến một tương lai thật tươi sáng.",
    ],
  },
  {
    id: "lavender",
    name: "Hoa lavender",
    theme: "Thấu hiểu và sẻ chia",
    plant: "lavender",
    message:
      "Mong mái ấm của hai bạn luôn là nơi có thể an tâm chia sẻ mọi điều.",
    prompts: [
      "Chúc hai bạn luôn hiểu nhau ngay cả khi không cần nói nhiều.",
      "Mong cả hai luôn biết lắng nghe và bao dung.",
      "Gửi một lời chúc về sự bình yên trong cuộc sống chung.",
    ],
    wishes: [
      "Chúc hai bạn luôn đủ kiên nhẫn để lắng nghe và đủ dịu dàng để thấu hiểu nhau.",
      "Mong mỗi khi mệt mỏi, hai bạn luôn có thể tìm thấy sự bình yên bên cạnh người mình yêu.",
      "Chúc hai bạn không chỉ chia sẻ niềm vui mà còn đủ vững vàng để cùng nhau đi qua những ngày khó khăn.",
      "Mong những khác biệt sẽ khiến hai bạn hiểu nhau hơn, chứ không xa nhau hơn.",
      "Chúc ngôi nhà của hai bạn luôn là nơi được lắng nghe, được sẻ chia và được yêu thương.",
      "Mong hai bạn luôn bao dung với những thiếu sót của nhau và cùng trưởng thành theo năm tháng.",
      "Chúc tình yêu của hai bạn luôn có đủ bình yên để nghỉ ngơi và đủ tin tưởng để đi xa.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi đến chúng mình một lời chúc thật ấm áp.",
      "Mong chúng mình sẽ luôn nhớ lắng nghe và dành cho nhau sự dịu dàng ấy.",
      "Cảm ơn bạn đã dành một chút thời gian để chúc phúc cho hai đứa.",
      "Lời chúc này khiến chúng mình thấy thật ấm lòng. Cảm ơn bạn nhé!",
      "Chúng mình sẽ cố gắng để nhà luôn là nơi bình yên nhất cho cả hai.",
      "Cảm ơn bạn đã góp thêm một điều thật đẹp vào ngày cưới của chúng mình.",
    ],
  },
  {
    id: "rose",
    name: "Hoa hồng",
    theme: "Tình yêu và lãng mạn",
    plant: "rose",
    message:
      "Mong tình yêu của hai bạn vẫn luôn có những rung động ngọt ngào như ngày đầu.",
    prompts: [
      "Chúc hai bạn luôn dành cho nhau những điều lãng mạn.",
      "Mong tình yêu ngày càng nồng nàn theo năm tháng.",
      "Gửi một lời chúc ngọt ngào đến cặp đôi.",
    ],
    wishes: [
      "Chúc hai bạn yêu nhau thật lâu, nắm tay thật chặt và không quên những buổi hẹn hò.",
      "Mong mỗi ngày bên nhau đều có một điều nhỏ bé khiến cả hai rung động.",
      "Chúc hai bạn dù đã là vợ chồng vẫn luôn tán tỉnh nhau như những ngày mới yêu.",
      "Mong những cái ôm, lời hỏi han và nụ cười sẽ luôn hiện diện trong cuộc sống chung.",
      "Chúc tình yêu của hai bạn càng qua năm tháng càng sâu sắc và ngọt ngào.",
      "Mong hai bạn luôn là ngoại lệ dịu dàng nhất trong cuộc sống của nhau.",
      "Chúc một đời thương nhau, hôm nay nhiều hơn hôm qua và ngày mai nhiều hơn hôm nay.",
    ],
    replies: [
      "Cảm ơn bạn! Chúng mình sẽ cố gắng giữ sự ngọt ngào này thật lâu.",
      "Lời chúc lãng mạn quá, xin nhận cùng một cái ôm từ xa nhé!",
      "Mong sau này chúng mình vẫn có thật nhiều buổi hẹn hò đáng nhớ.",
      "Cảm ơn bạn đã gửi một chút ngọt ngào đến ngày vui của chúng mình.",
      "Hy vọng tình yêu của chúng mình sẽ luôn đẹp như lời chúc bạn gửi.",
      "Cảm ơn bạn nhiều nha, chúc bạn cũng luôn được yêu thương thật nhiều!",
    ],
  },
  {
    id: "calla-lily",
    name: "Hoa rum",
    theme: "Thanh lịch và khởi đầu mới",
    plant: "calla-lily",
    message:
      "Một chương mới bắt đầu, mong những trang tiếp theo đều thật đáng nhớ.",
    prompts: [
      "Chúc hai bạn có một khởi đầu thật thuận lợi.",
      "Mong chặng đường phía trước có nhiều điều tốt đẹp.",
      "Gửi lời chúc cho cuộc sống mới của đôi uyên ương.",
    ],
    wishes: [
      "Chúc hai bạn khởi đầu cuộc sống hôn nhân thật suôn sẻ và ngày càng hạnh phúc.",
      "Mong chương mới này sẽ có thật nhiều trải nghiệm đẹp, những giấc mơ chung và những bất ngờ thú vị.",
      "Chúc hai bạn luôn tự tin cùng nhau đưa ra những quyết định quan trọng trong cuộc sống.",
      "Mong mọi bước ngoặt phía trước đều đưa hai bạn đến gần hơn với cuộc sống mình mong muốn.",
      "Chúc gia đình nhỏ luôn vững vàng, thuận hòa và đầy ắp niềm vui.",
      "Mong hành trình mới của hai bạn có nhiều cơ hội, nhiều may mắn và nhiều lý do để mỉm cười.",
      "Chúc hai bạn cùng viết nên một câu chuyện hôn nhân thật đẹp theo cách riêng của mình.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho khởi đầu mới của chúng mình thật tốt đẹp!",
      "Chúng mình cũng rất mong chờ những điều đang đợi phía trước. Cảm ơn bạn nhé!",
      "Cảm ơn bạn đã gửi lời chúc đến chương mới trong cuộc đời hai đứa.",
      "Mong những điều tốt lành sẽ đến với tất cả chúng ta!",
      "Lời chúc của bạn là một kỷ niệm thật đẹp trong ngày cưới này.",
      "Cảm ơn bạn đã cùng chúng mình đánh dấu ngày đặc biệt này.",
    ],
  },
  {
    id: "lotus",
    name: "Hoa sen",
    theme: "An nhiên và bền vững",
    plant: "lotus",
    message: "Mong hai bạn luôn bình tâm, bao dung và vững vàng bên nhau.",
    prompts: [
      "Chúc hai bạn luôn bình yên trước mọi đổi thay.",
      "Mong tình yêu luôn lớn lên từ sự bao dung.",
      "Gửi một lời chúc cho mái ấm an nhiên.",
    ],
    wishes: [
      "Chúc hai bạn có một cuộc sống bình yên, ít lo toan và luôn biết trân trọng nhau.",
      "Mong dù cuộc sống đổi thay, hai bạn vẫn giữ được sự tin tưởng và dịu dàng dành cho nhau.",
      "Chúc hai bạn đủ bao dung để bỏ qua những điều nhỏ nhặt và đủ yêu thương để cùng nhau tiến bước.",
      "Mong ngôi nhà của hai bạn luôn có sự hòa thuận, ấm áp và cảm giác an toàn.",
      "Chúc hai bạn biết chậm lại giữa những ngày bận rộn để tận hưởng cuộc sống bên nhau.",
      "Mong tình yêu của hai bạn ngày càng vững vàng, không cần ồn ào nhưng luôn sâu sắc.",
      "Chúc hai bạn cùng nhau sống một cuộc đời bình dị mà hạnh phúc.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho chúng mình một cuộc sống bình yên.",
      "Chúng mình sẽ ghi nhớ lời chúc về sự bao dung và thấu hiểu này.",
      "Cảm ơn bạn đã gửi một điều thật nhẹ nhàng đến ngày vui của chúng mình.",
      "Mong mỗi ngày sau này đều có một chút bình yên như lời bạn chúc.",
      "Lời chúc của bạn thật ý nghĩa. Cảm ơn bạn nhiều nhé!",
      "Cảm ơn bạn đã mong những điều tốt đẹp cho mái ấm nhỏ của chúng mình.",
    ],
  },
  {
    id: "cherry-blossom",
    name: "Hoa anh đào",
    theme: "Khởi đầu và trân trọng hiện tại",
    plant: "cherry-blossom",
    message: "Mong hai bạn luôn nhận ra vẻ đẹp của những khoảnh khắc đang có.",
    prompts: [
      "Chúc hai bạn trân trọng từng ngày bên nhau.",
      "Mong mỗi mùa trong cuộc sống đều có điều đáng nhớ.",
      "Gửi lời chúc cho những kỷ niệm sắp tới.",
    ],
    wishes: [
      "Chúc hai bạn tạo nên thật nhiều kỷ niệm đẹp trong những năm tháng sắp tới.",
      "Mong mỗi mùa trong cuộc đời đều mang đến những điều mới mẻ và đáng mong đợi.",
      "Chúc hai bạn luôn biết tận hưởng hiện tại và cùng nhau chờ đón tương lai.",
      "Mong mỗi năm kỷ niệm ngày cưới đều là dịp để hai bạn nhìn lại và mỉm cười.",
      "Chúc hành trình chung có thật nhiều chuyến đi, những lần khám phá và khoảnh khắc đáng nhớ.",
      "Mong hai bạn luôn nhìn thấy những điều đẹp đẽ trong nhau, kể cả sau nhiều năm.",
      "Chúc mỗi ngày bên nhau đều góp thêm một trang thật đẹp vào câu chuyện tình yêu.",
    ],
    replies: [
      "Cảm ơn bạn đã góp thêm một kỷ niệm đẹp cho ngày hôm nay.",
      "Mong chúng mình sẽ có thật nhiều mùa đáng nhớ cùng nhau. Cảm ơn bạn nhé!",
      "Cảm ơn bạn đã gửi lời chúc cho hành trình sắp tới của hai đứa.",
      "Chúng mình sẽ cố gắng trân trọng thật nhiều những khoảnh khắc bên nhau.",
      "Lời chúc của bạn sẽ là một phần đáng nhớ trong ngày cưới này.",
      "Cảm ơn bạn đã cùng chúng mình lưu lại một kỷ niệm thật đẹp.",
    ],
  },
  {
    id: "orchid",
    name: "Hoa lan",
    theme: "Tinh tế và bền bỉ",
    plant: "orchid",
    message:
      "Mong tình yêu luôn sâu sắc và lớn lên theo cách riêng của hai bạn.",
    prompts: [
      "Chúc hai bạn luôn tự hào về người đồng hành của mình.",
      "Mong tình yêu càng lâu càng sâu sắc.",
      "Gửi lời chúc cho một tình yêu trưởng thành.",
    ],
    wishes: [
      "Chúc hai bạn luôn nhìn thấy những điều đáng quý ở nhau và không ngừng trân trọng điều đó.",
      "Mong tình yêu của hai bạn trưởng thành qua từng thử thách và càng ngày càng bền chặt.",
      "Chúc hai bạn luôn giữ được sự tôn trọng, tin tưởng và ngưỡng mộ dành cho nhau.",
      "Mong mỗi người đều có thể phát triển theo cách mình mong muốn mà vẫn luôn đồng hành cùng người kia.",
      "Chúc hai bạn cùng nhau xây dựng một cuộc sống chất lượng, nhiều trải nghiệm và nhiều yêu thương.",
      "Mong hai bạn luôn đủ tinh tế để nhận ra những nỗ lực nhỏ bé của nhau.",
      "Chúc tình yêu của hai bạn không cần hoàn hảo, chỉ cần luôn chân thành và bền lâu.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi một lời chúc thật sâu sắc đến chúng mình.",
      "Chúng mình sẽ cùng nhau cố gắng để ngày càng hiểu và trân trọng nhau hơn.",
      "Cảm ơn bạn đã chúc phúc cho tình yêu của hai đứa.",
      "Lời chúc của bạn khiến ngày đặc biệt này càng thêm ý nghĩa.",
      "Mong chúng mình sẽ luôn có thể tự hào về nhau như bạn đã chúc.",
      "Cảm ơn bạn đã dành sự quan tâm cho hành trình mới của chúng mình.",
    ],
  },
  {
    id: "carnation",
    name: "Hoa cẩm chướng",
    theme: "Quan tâm và gắn bó",
    plant: "carnation",
    message:
      "Tình yêu lớn lên từ những lần hỏi han và những điều nhỏ bé được làm cho nhau.",
    prompts: [
      "Chúc hai bạn luôn quan tâm nhau từ những điều nhỏ nhất.",
      "Mong những ngày bận rộn vẫn có thời gian dành cho nhau.",
      "Gửi lời chúc cho một mái ấm đầy sự chăm sóc.",
    ],
    wishes: [
      "Chúc hai bạn luôn nhớ hỏi han nhau, dù chỉ là một câu hôm nay có mệt không.",
      "Mong tình yêu luôn hiện diện trong những việc nhỏ bé mà hai bạn làm cho nhau mỗi ngày.",
      "Chúc hai bạn có thể chia sẻ việc nhà, sẻ chia áp lực và cùng chăm chút cho mái ấm.",
      "Mong dù bận rộn đến đâu, hai bạn vẫn không quên quan tâm đến cảm xúc của người kia.",
      "Chúc hai bạn luôn là người đầu tiên muốn kể chuyện vui và cũng là người muốn tìm đến khi buồn.",
      "Mong sự quan tâm chân thành sẽ khiến tình yêu ngày càng gắn bó.",
      "Chúc hai bạn luôn thương nhau bằng cả lời nói lẫn hành động.",
    ],
    replies: [
      "Cảm ơn bạn đã nhắc chúng mình về những điều nhỏ bé nhưng quan trọng.",
      "Chúng mình sẽ cố gắng quan tâm nhau nhiều hơn mỗi ngày. Cảm ơn bạn nhé!",
      "Cảm ơn bạn đã gửi lời chúc thật gần gũi và ấm áp.",
      "Mong những điều bình dị ấy sẽ luôn có trong mái ấm của chúng mình.",
      "Lời chúc rất đáng yêu, cảm ơn bạn đã dành cho hai đứa!",
      "Cảm ơn bạn đã cùng chúng mình chia sẻ niềm vui này.",
    ],
  },
  {
    id: "hydrangea",
    name: "Hoa cẩm tú cầu",
    theme: "Biết ơn và thấu hiểu",
    plant: "hydrangea",
    message:
      "Mong hai bạn luôn biết lắng nghe những điều chưa kịp nói thành lời.",
    prompts: [
      "Chúc hai bạn luôn tôn trọng những khác biệt của nhau.",
      "Mong cả hai biết nói lời cảm ơn và xin lỗi đúng lúc.",
      "Gửi một lời chúc cho sự thấu hiểu trong hôn nhân.",
    ],
    wishes: [
      "Chúc hai bạn luôn lắng nghe bằng sự chân thành và nói chuyện với nhau bằng sự tôn trọng.",
      "Mong mỗi bất đồng đều trở thành cơ hội để hai bạn hiểu nhau hơn.",
      "Chúc hai bạn luôn biết nói lời cảm ơn, xin lỗi và dành cho nhau những cơ hội để sửa sai.",
      "Mong những khác biệt sẽ làm cuộc sống chung thêm phong phú chứ không trở thành khoảng cách.",
      "Chúc hai bạn luôn biết trân trọng sự hiện diện của nhau, kể cả trong những ngày rất bình thường.",
      "Mong tình yêu ngày càng sâu sắc nhờ sự cảm thông và lòng biết ơn.",
      "Chúc hai bạn luôn có thể thành thật với nhau và cùng nhau tìm ra cách giải quyết mọi chuyện.",
    ],
    replies: [
      "Cảm ơn bạn đã gửi một lời chúc thật tinh tế đến chúng mình.",
      "Chúng mình sẽ luôn nhớ rằng lắng nghe cũng là một cách yêu thương.",
      "Lời chúc này rất ý nghĩa, cảm ơn bạn đã dành cho hai đứa!",
      "Mong chúng mình sẽ ngày càng thấu hiểu nhau như bạn đã chúc.",
      "Cảm ơn bạn đã nhắc đến những điều quan trọng trong một cuộc hôn nhân.",
      "Chúng mình xin nhận lời chúc và gửi đến bạn thật nhiều yêu thương!",
    ],
  },
  {
    id: "magnolia",
    name: "Hoa mộc lan",
    theme: "Trưởng thành và khởi sắc",
    plant: "magnolia",
    message:
      "Mong hai bạn cùng nhau lớn lên, nhưng vẫn giữ được những điều làm nên chính mình.",
    prompts: [
      "Chúc hai bạn cùng trưởng thành qua mỗi chặng đường.",
      "Mong những ước mơ riêng và chung đều được vun đắp.",
      "Gửi lời chúc cho một tương lai nhiều khởi sắc.",
    ],
    wishes: [
      "Chúc hai bạn cùng trưởng thành, cùng tiến bộ và luôn tự hào về hành trình của nhau.",
      "Mong cả hai đều được theo đuổi đam mê và có người đồng hành ủng hộ phía sau.",
      "Chúc những mục tiêu chung sẽ lần lượt thành hiện thực nhờ sự kiên trì của hai bạn.",
      "Mong cuộc sống chung mở ra nhiều cơ hội mới và những trải nghiệm khiến cả hai trưởng thành hơn.",
      "Chúc hai bạn luôn động viên nhau khi bắt đầu điều mới và kiên nhẫn khi mọi thứ chưa như ý.",
      "Mong sau nhiều năm, cả hai vẫn có thể nhìn lại và thấy mình đã cùng nhau đi được thật xa.",
      "Chúc mỗi bước tiến của một người đều là niềm vui của người còn lại.",
    ],
    replies: [
      "Cảm ơn bạn đã chúc cho hành trình trưởng thành của chúng mình.",
      "Chúng mình sẽ cùng nhau cố gắng và cổ vũ cho những ước mơ của nhau.",
      "Cảm ơn bạn đã gửi một lời chúc đầy hy vọng đến hai đứa!",
      "Mong những năm tới sẽ mang đến thật nhiều điều tốt đẹp như bạn mong.",
      "Lời chúc của bạn sẽ là động lực để chúng mình tiếp tục cố gắng.",
      "Cảm ơn bạn đã tin tưởng và chúc phúc cho tương lai của chúng mình.",
    ],
  },
  {
    id: "cosmos",
    name: "Hoa cánh bướm",
    theme: "Tự do và niềm vui",
    plant: "cosmos",
    message:
      "Mong hai bạn luôn được là chính mình và vẫn muốn cùng nhau đi thật xa.",
    prompts: [
      "Chúc hai bạn có thật nhiều tiếng cười.",
      "Mong cả hai luôn tôn trọng cá tính của nhau.",
      "Gửi lời chúc cho một cuộc sống chung thật nhiều màu sắc.",
    ],
    wishes: [
      "Chúc hai bạn luôn vui vẻ, thoải mái và không ngừng tạo ra những kỷ niệm thú vị.",
      "Mong mỗi người vẫn có không gian để theo đuổi sở thích và luôn có người chia sẻ niềm vui.",
      "Chúc hai bạn cùng nhau khám phá những điều mới mẻ và không ngại thử những trải nghiệm thú vị.",
      "Mong cuộc sống hôn nhân không chỉ có trách nhiệm mà còn có thật nhiều tiếng cười.",
      "Chúc hai bạn luôn tôn trọng cá tính của nhau và yêu nhau cả khi không giống nhau.",
      "Mong những ngày bình thường cũng đầy màu sắc nhờ những ý tưởng bất chợt của hai bạn.",
      "Chúc hai bạn vừa là một gia đình vững vàng, vừa là đôi bạn thân luôn vui vẻ bên nhau.",
    ],
    replies: [
      "Cảm ơn bạn! Chúng mình sẽ cố gắng sống thật vui và tận hưởng từng ngày.",
      "Lời chúc đầy năng lượng quá, cảm ơn bạn nhiều nha!",
      "Mong chúng mình sẽ có thật nhiều chuyến đi và trải nghiệm để kể lại.",
      "Cảm ơn bạn đã chúc cho cuộc sống chung của hai đứa luôn nhiều màu sắc.",
      "Chúng mình xin nhận lời chúc và hứa sẽ cố gắng cười thật nhiều!",
      "Cảm ơn bạn đã mang thêm niềm vui đến ngày cưới của chúng mình.",
    ],
  },
];
