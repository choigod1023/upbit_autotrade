# upbit_autotrade

# 1. 개요
업비트를 이용하여 코인 매매를 이용하고 있었다. '존버'만 해서는 수익을 절대 낼 수 없을 것이라 판단. 자동으로 감시매매를 할 수 있는 프로그램을 만들어, 손절율과 익절율을 정하여 매매를 한다면 수익을 낼 수 있지 않을까 라는 궁금증으로 node를 이용한 api 호출 및 자동 감시 매매 프로그램을 만들기로 결심하였다.

# 2. 프로그램 스펙
[업비트 api](https://docs.upbit.com/reference)에서 요구하는 스펙인 uuid, jsonwebtoken, crypto, querystring 라이브러리 사용
request Promise 작업을 위해 request-promise-native 라이브러리 사용

# 3. 프로그램 구성
이 프로그램은 main.js 를 메인으로 한 모듈화로 구성되어 있음.

## 3.1. [main.js](https://github.com/choigod1023/upbit_autotrade/blob/main/main.js)
위 모듈은 1초 간격으로 app 이라는 function을 실행한다.
### 3.1.1. "app" function 구성
1. otherorder.js 의 accont_payload_options function을 호출하여 app function의 request argument에 담아 request 요청을 보낸다.

2. response된 JSON을 parse해 우리가 원하는 정보들로 가공을 한다.

3. otherorder.js 의 order_payload_options function에 'orders/chance?' 라우터 인자('https://api.upbit.com/v1/orders/chance')와 현재 가지고 있는 코인명을 인자로 보낸 리턴값을 request argument에 담아 request 요청을 보낸다.

3-1. 이 과정에서 오류가 발생해 예외처리의 catch 부분으로 이동하게 된다면, 현재 보유하고 있는 코인이 없는 상태로 현금화 되어있는 상태이다. 따라서 sellorder.js의 select_market function을 호출한 이후 랜덤으로 코인을 지정한다. 그 이후 buyorder.js의 buy_order 함수에 지정한 코인명과 현금 보유량을 인자로 호출한 이후 return 값을 request의 options인자로 넣어 호출한다.

4. response 받은 body를 따로 가공할 필요가 없기에 전역 변수로 설정이 되어있는 코인명을 넣은 현재 분봉의 가격을 알기 위해 api를 호출한다.

5. body를 가공하여 현재 수익율을 계산해 -3.5이하 이거나 5.0 이상의 수익율이라면 sellorder.js의 sell_order function을 호출한다.

6. 이 과정을 1초 간격으로 반복한다.

## 3.2. [buyorder.js](https://github.com/choigod1023/upbit_autotrade/blob/main/buyorder.js)
### 3.2.1. "buy_order" function 구성
#### market 인자
코인 시장명을 의미한다.
#### balance 인자
현금 보유량을 의미한다.
#### 작동 방식
market 인자의 분봉 가격(참조 : https://docs.upbit.com/reference#%EB%B6%84minute-%EC%BA%94%EB%93%A4-1)을 받은 뒤 [주문하기 DOCS](https://docs.upbit.com/reference#%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0)에서 매수 시 요구하는 방식대로 가공하여 options 객체 리턴하는 함수이다.

## 3.3. [sellorder.js](https://github.com/choigod1023/upbit_autotrade/blob/main/sellorder.js)
### 3.3.1. "select_market" function 구성
main.js에서 랜덤으로 코인을 지정하기 위해 upbit의 주간 변동률 순위를 10위까지만 불러오는 api('https://crix-api-cdn.upbit.com/v1/crix/trends/weekly_change_rate?count=10)를 호출한다.
### 3.3.2. "sell_order" function 구성
#### market 인자
코인 시장명을 의미한다.
#### balance 인자
코인 보유량을 의미한다.
#### 작동 방식
[주문하기 DOCS](https://docs.upbit.com/reference#%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0)에서 매도 시 요구하는 방식대로 가공하여 options 객체를 리턴하는 함수이다. 매도 방식은 시장가 매도이다.

## 3.4 [otherorder.js](https://github.com/choigod1023/upbit_autotrade/blob/main/otherorder.js)
### 3.4.1. "accont_payload_opotions" function 구성
[전체 계좌 조회 DOCS](https://docs.upbit.com/reference#%EC%A0%84%EC%B2%B4-%EA%B3%84%EC%A2%8C-%EC%A1%B0%ED%9A%8C)의 요구방식으로 작업하여 options 객체를 리턴한다.
### 3.4.2. "rand" function 구성
#### min 인자
랜덤 숫자의 범위를 정할 때의 최솟값을 의미한다.
#### max 인자
랜덤 숫자 범위 중 최댓값을 의미한다.
min 부터 max 까지의 값 중 랜덤으로 한 숫자를 뽑아서 리턴한다.
### 3.4.3. "order_payload_options" function 구성
#### route 인자
uri에 어떤 라우터를 추가할지에 관한 인자이다.
#### market 인자
코인 시장명을 의미한다.
[주문 가능 정보 DOCS](https://docs.upbit.com/reference#%EC%A3%BC%EB%AC%B8-%EA%B0%80%EB%8A%A5-%EC%A0%95%EB%B3%B4)에 필요한 정보들을 가공하여 options 객체를 리턴한다.

# 4. 프로그램 사용 이후
처음 프로그램을 돌리기 시작하였을 때에는 거래 회전율을 높여 빠른 손절과 빠른 이익을 보겠다는 생각으로 손절가를 정해두었다. 하지만 손절가 밑으로 내려가 시장가 매도를 진행하는 비율이 익절가 이상으로 도달해 시장가 매도하는 비율보다 많아 손해를 많이 보게 되었다. 이후에 손절가 비율을 지우고 익절가 비율로만 거래를 진행하게 되었는데, 그러자 익절가 5.0% 이상까지 오르지 않아 한참을 기다리게 되는 상황이 발생하였다. 이 때문에 36000원으로 시작했던 실험을 30000원이 되어 -6000원을 손해보게 되었다. 이러한 실패 이후에 다른 매매방식을 도입하여 익절을 할 수 있을까 하는 생각을 가지게 되었다. 아래는 프로그램 실행 전과 거래 내역, 실행 후이다.
![KakaoTalk_20210812_182311088](https://user-images.githubusercontent.com/39482623/129173554-7abe5b94-55f6-48ca-a63e-2235650e6997.jpg)
![KakaoTalk_20210812_182311088_01](https://user-images.githubusercontent.com/39482623/129173557-17f99600-b68a-4d0c-a8ef-930a5f726efc.jpg)
![KakaoTalk_20210812_182311088_02](https://user-images.githubusercontent.com/39482623/129173559-b8bbd72f-d552-48bc-8d70-d32dbf3b09d0.jpg)
