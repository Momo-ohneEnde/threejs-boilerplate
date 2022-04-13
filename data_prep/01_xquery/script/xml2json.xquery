xquery version "3.0";
declare namespace tei = "http://www.tei-c.org/ns/1.0";
declare namespace output="http://www.w3.org/2010/xslt-xquery-serialization";
declare option output:method "text";
declare variable $letters := collection('./GB01_Daten/letters_and_commentaries/?select=*.xml');


xml-to-json(
<map xmlns ="http://www.w3.org/2005/xpath-functions"><array key="letters">{
for $correspDesc in $letters//tei:correspDesc
    let $letterID := $correspDesc/@key/data()
    let $placeSent := $correspDesc/tei:correspAction[@type="sent"]/tei:placeName/data()
    let $placeSentID := $correspDesc/tei:correspAction[@type="sent"]/tei:placeName/@ref/data()
    let $date := $correspDesc/tei:correspAction[@type="sent"]/tei:date/@when/data()        
        
    let $receiver := $correspDesc/tei:correspAction[@type="received"]/tei:persName/data()
    let $receiverKey := $correspDesc/tei:correspAction[@type="received"]/tei:persName/@key/data()
    let $receiverID := $correspDesc/tei:correspAction[@type="received"]/tei:persName/@ref/data()
    let $placeReceived := $correspDesc/tei:correspAction[@type="received"]/tei:placeName/data()
    let $placeReceivedID := $correspDesc/tei:correspAction[@type="received"]/tei:placeName/@ref/data()
return 
<map xmlns ="http://www.w3.org/2005/xpath-functions">
    <string key="id">{$letterID}</string>
    <string key="placeSent">{$placeSent}</string>
    <string key="placeSentId">{$placeSentID}</string>
    <string key="date">{$date}</string>
    <string key="receiver">{$receiver}</string>
    <string key="receiverKey">{$receiverKey}</string>
    <string key="receiverId">{$receiverID}</string>
    <string key="placeReceived">{$placeReceived}</string>
    <string key="placeReceivedID">{$placeReceivedID}</string>
</map>
}
</array>
</map>, map { 'indent' : true() } 
)