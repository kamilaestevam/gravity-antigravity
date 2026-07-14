import com.sap.gateway.ip.core.customdev.util.Message
import java.util.UUID

Message processData(Message message) {
    def headers = message.getHeaders()
    def idempotency = headers.get('Idempotency-Key')

    if (idempotency == null || idempotency.toString().trim().isEmpty()) {
        idempotency = UUID.randomUUID().toString()
    }

    message.setHeader('Idempotency-Key', idempotency.toString())
    message.setHeader('x-chave-idempotencia', idempotency.toString())
    return message
}
