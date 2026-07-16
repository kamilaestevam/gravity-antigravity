import com.sap.gateway.ip.core.customdev.util.Message
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

Message processData(Message message) {
    def body = message.getBody(String.class)
    def headers = message.getHeaders()
    def signature = headers.get('X-Gravity-Signature')
    def secret = message.getProperty('GRAVITY_WEBHOOK_SECRET')

    if (secret == null || signature == null) {
        throw new IllegalStateException('Segredo ou assinatura ausente')
    }

    def mac = Mac.getInstance('HmacSHA256')
    mac.init(new SecretKeySpec(secret.getBytes('UTF-8'), 'HmacSHA256'))
    def expected = mac.doFinal(body.getBytes('UTF-8')).encodeHex().toString()

    if (!expected.equalsIgnoreCase(signature.toString())) {
        throw new SecurityException('HMAC invalido')
    }

    return message
}
