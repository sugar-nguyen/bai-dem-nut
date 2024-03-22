const Game = function () {
    const g = this;
    this.play = function () {

        function onlyUnique(value, index, array) {
            return array.indexOf(value) === index;
        }

        $('#playBtn').click(function () {
            var playerListVal = $('#playerList').val();
            if (playerListVal.trim() === '')
                return false;
            var playerListArr = Array.from(playerListVal.trim().split('\n')).filter(x => x !== '');
            g.renderCards(playerListArr.filter(onlyUnique));
        });
    }
    this.renderCards = function (playerList) {
        var gridCol = 7;
        var deck = g.createDeck();
        var hands = g.dealCards(playerList, deck);

        var html = `<div class="grid grid-cols-${gridCol} gap-x-2 gap-y-6 relative">`;

        $.each(playerList, function (i, item) {
            html += `<div class="w-full flex flex-col px-2 player" id="player_${(i + 1)}">`;
            html += `<div class="py-2 text-center bg-gray-800 text-white mb-2">${item}</div>`;
            html += ` <div class="w-full flex flex-col card-wrapper" data-player="${item}">`;
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';

        $('#game').html(html).fadeIn();

        var promiss = new Promise(function (success, _) {
            setTimeout(function () {
                const cardWrapper = document.querySelectorAll('.card-wrapper');
                cardWrapper.forEach((wrapper, _) => {
                    var player = $(wrapper).data('player');
                    // Hiển thị các lá bài ở vị trí người chơi
                    hands[player].forEach((_, i) => {
                        setTimeout(() => {
                            var marginT = i > 0 ? "-mt-[98%]" : "";
                            var cardElement = $(` <div class="w-full">
                                             <div class="${marginT} shadow-lg relative">
                                                 <img src="/assets/imgs/back.png" class="cards-back card" alt="">
                                                 <img src="/assets/imgs/${hands[player][i].name}" class="hidden card cards-front" alt="">
                                             </div>
                                         </div>`);
                            $(wrapper).append(cardElement);

                            // Sử dụng GSAP để tạo hiệu ứng di chuyển
                            gsap.from(cardElement, {
                                duration: 0.5,
                                x: 100 * i, // Di chuyển theo trục X
                                y: -100, // Di chuyển theo trục Y
                                rotation: Math.random() * 90 - 45, // Xoay ngẫu nhiên
                                ease: "power2.out", // Loại hình thức dễ dàng,
                                delay: i * 0.1, // Delay để tạo ra hiệu ứng chia bài theo từng lá
                            });
                        }, i * 500);
                        return false;
                    });

                    var message = g.getPoint(hands, player);
                    $(`<div class="w-full p2-4 flex justify-center border border-gray-400 mt-2 bg-white shadow-md hidden point">
                        <span class="font-bold text-lg">${message}</span>
                        </div>`).insertAfter(wrapper);
                });
                success();
            }, 2000);


        });

        promiss.then(function () {
            setTimeout(() => {
                $('.cards-back').addClass('hidden');
                var cards = document.querySelectorAll('.cards-front');
                cards.forEach(g.flipCard);

                $('.player').draggable({
                    revert: true
                });

                setTimeout(function () {
                    g.sort(hands);
                }, 1000);
            }, 4000);
        });


    }
    this.createDeck = function () {
        // Tạo một mảng đại diện cho bộ bài 52 lá
        const deck = [];
        for (let i = 0; i < 52; i++) {
            let point = (i % 13) + 1;
            deck.push({
                suit: Math.floor(i / 13),
                point: point - 10 === 0 ? 0 : (point > 10 ? 999 : point),
                name: `front-${i}.png`
            });
        }
        return deck;
    }
    this.getPoint = function (hands, player) {
        var point = 0;
        var is3Cao = hands[player].filter(x => x.point === 999).length === 3;
        if (!is3Cao) {
            for (let hand of hands[player]) {
                var p = hand.point;
                if (p === 999) p = 0;
                point += p;
            }
        }

        if (point >= 20) point = point % 20;
        else if (point >= 10) point = point % 10;

        var message = point > 0 ? point + " nút" : "bù trất";
        return is3Cao ? "3 cào" : message;
    }
    this.dealCards = function (playerList, deck) {
        const hands = {};

        for (let player of playerList) {
            hands[player] = [];
        }

        for (let i = 0; i < 3; i++) {
            for (let player of playerList) {
                const randomIndex = Math.floor(Math.random() * deck.length);
                const card = deck.splice(randomIndex, 1)[0];
                hands[player].push(card);
            }
        }

        return hands;
    }
    this.flipCard = function (card) {
        card.classList.remove('hidden');
        gsap.to(card, {
            duration: 0.5, // Thời gian thực hiện hiệu ứng (giây)
            rotationY: 180, // Độ quay theo trục Y
            ease: "power2.inOut", // Loại hình thức dễ dàng
            onComplete: function () {
                $('.point').removeClass('hidden');
            }
        });
    }
    this.sort = function (hands) {
        const entries = Object.entries(hands);
        var arr = [];
        entries.forEach((item, index) => {
            var score = 0;
            var isBest = item[1].filter(x => x.point === 999).length === 3;
            if (!isBest) {
                for (let p of item[1]) {
                    var point = p.point;
                    if (point === 999) point = 0;
                    score += point;
                }
                if (score >= 20) score = score % 20;
                else if (score >= 10) score = score % 10;
            } else score = 999;
            arr.push({
                index: index + 1,
                name: item[0],
                score: score
            });
        });

        arr.sort((a, b) => b.score - a.score);

        arr.forEach((item, index) => {
            setTimeout(function () {
                var position = {
                    left: $(`#player_${index + 1}`).position().left,
                    top: $(`#player_${index + 1}`).position().top
                };

                var left = item.index === 1 ? position.left * -1 : position.left;

                $(`#player_${item.index}`).animate({ left: left, top: position.top }, 200);
            }, 1000);

        });


    }

    this.play();
}