import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";

// Mutation para registrar eventos de pago
const PAYMENT_STATUS_MUTATION = gql`
    mutation PaymentStatus(
        $operationId: Int!
        $eventType: String!
        $status: String!
        $requestData: JSONString
        $responseData: JSONString
    ) {
        paymentStatus(
            operationId: $operationId
            eventType: $eventType
            status: $status
            requestData: $requestData
            responseData: $responseData
        ) {
            success
            cashFlow {
                id
                status
            }
        }
    }
`;

export const usePaymentEvents = () => {
    const [paymentStatusMutation, { loading }] = useMutation(
        PAYMENT_STATUS_MUTATION
    );

    const handlePaymentEvent = async (
        operationId: number,
        eventType: string,
        status: string,
        requestData?: any,
        responseData?: any
    ) => {
        try {
            const graphqlVariables: any = {
                operationId,
                eventType,
                status,
            };

            if (requestData !== undefined) {
                graphqlVariables.requestData = JSON.stringify(requestData);
            }
            if (responseData !== undefined) {
                graphqlVariables.responseData = JSON.stringify(responseData);
            }

            const result = await paymentStatusMutation({
                variables: graphqlVariables,
            });

            console.log(`✅ Evento ${eventType} registrado:`, result);
            return result;
        } catch (error) {
            console.error(`❌ Error registrando evento ${eventType}:`, error);
            throw error;
        }
    };

    return {
        events: {
            // === FLUJO PRINCIPAL ===

            // 1. Orden creada
            orderCreated: (operationId: number, orderData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "ORDER_CREATED",
                    "PENDING",
                    orderData
                ),

            // 2. Solicitud de pago creada
            createPaymentRequest: (
                operationId: number,
                amount: number,
                requestData?: any
            ) =>
                handlePaymentEvent(
                    operationId,
                    "CREATE_PAYMENT_REQUEST",
                    "PENDING",
                    requestData
                ),

            // 3. FormToken generado exitosamente
            createPaymentSuccess: (
                operationId: number,
                formToken: string,
                responseData?: any
            ) =>
                handlePaymentEvent(
                    operationId,
                    "CREATE_PAYMENT_SUCCESS",
                    "SUCCESS",
                    { formToken },
                    responseData
                ),

            // 4. Falló la creación del pago
            createPaymentFailed: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "CREATE_PAYMENT_FAILED",
                    "FAILED",
                    errorData
                ),

            // 5. Formulario de pago mostrado
            paymentFormDisplayed: (operationId: number) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_FORM_DISPLAYED",
                    "PENDING"
                ),

            // 6. Pago enviado por el cliente
            paymentSubmitted: (operationId: number, paymentData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_SUBMITTED",
                    "PENDING",
                    paymentData
                ),

            // 7. Pago autorizado
            paymentAuthorized: (operationId: number, authData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_AUTHORIZED",
                    "AUTHORIZED",
                    authData
                ),

            // 8. Fondos capturados
            paymentCaptured: (operationId: number, captureData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_CAPTURED",
                    "CAPTURED",
                    captureData
                ),

            // 9. Pago completado
            paymentSuccess: (operationId: number, successData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_SUCCESS",
                    "PAID",
                    successData
                ),

            // 10. Pago fallido
            paymentFailed: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_FAILED",
                    "FAILED",
                    errorData
                ),

            // 11. Pago pendiente de revisión
            paymentPending: (operationId: number, pendingData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_PENDING",
                    "PENDING",
                    pendingData
                ),

            // === REEMBOLSOS ===

            // 12. Reembolso solicitado
            refundRequested: (operationId: number, refundData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "REFUND_REQUESTED",
                    "PENDING",
                    refundData
                ),

            // 13. Reembolso procesado
            refundProcessed: (operationId: number, refundData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "REFUND_PROCESSED",
                    "COMPLETED",
                    refundData
                ),

            // 14. Reembolso fallido
            refundFailed: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "REFUND_FAILED",
                    "FAILED",
                    errorData
                ),

            // === WEBHOOKS ===

            // 15. Webhook recibido
            webhookReceived: (operationId: number, webhookData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "WEBHOOK_RECEIVED",
                    "RECEIVED",
                    webhookData
                ),

            // 16. Webhook procesado
            webhookProcessed: (operationId: number, webhookData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "WEBHOOK_PROCESSED",
                    "PROCESSED",
                    webhookData
                ),

            // 17. Error al procesar webhook
            webhookError: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "WEBHOOK_ERROR",
                    "ERROR",
                    errorData
                ),

            // === SEGURIDAD ===

            // 18. Revisión por fraude
            fraudReview: (operationId: number, fraudData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "FRAUD_REVIEW",
                    "UNDER_REVIEW",
                    fraudData
                ),

            // 19. Contracargo solicitado
            chargebackRequested: (operationId: number, chargebackData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "CHARGEBACK_REQUESTED",
                    "PENDING",
                    chargebackData
                ),

            // 20. Contracargo resuelto
            chargebackResolved: (operationId: number, resolutionData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "CHARGEBACK_RESOLVED",
                    "RESOLVED",
                    resolutionData
                ),

            // === MANTENIMIENTO ===

            // 21. Conciliación programada
            scheduledReconciliation: (
                operationId: number,
                reconciliationData?: any
            ) =>
                handlePaymentEvent(
                    operationId,
                    "SCHEDULED_RECONCILIATION",
                    "SCHEDULED",
                    reconciliationData
                ),

            // 22. Token expirado
            tokenExpired: (operationId: number, tokenData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "TOKEN_EXPIRED",
                    "EXPIRED",
                    tokenData
                ),

            // === EVENTOS ESPECÍFICOS DE IZIPAY ===

            // 23. Redirección a Izipay
            redirectToIzipay: (operationId: number, redirectData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "REDIRECT_TO_IZIPAY",
                    "REDIRECTED",
                    redirectData
                ),

            // 24. Respuesta de Izipay recibida
            izipayResponseReceived: (operationId: number, responseData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "IZIPAY_RESPONSE_RECEIVED",
                    "RECEIVED",
                    responseData
                ),

            // 25. Validación de firma HMAC
            hmacValidation: (operationId: number, validationData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "HMAC_VALIDATION",
                    "VALIDATED",
                    validationData
                ),

            // 26. Error de validación HMAC
            hmacValidationError: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "HMAC_VALIDATION_ERROR",
                    "ERROR",
                    errorData
                ),

            // === EVENTOS DE USUARIO ===

            // 27. Usuario inició pago
            userInitiatedPayment: (operationId: number, userData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "USER_INITIATED_PAYMENT",
                    "INITIATED",
                    userData
                ),

            // 28. Usuario canceló pago
            userCancelledPayment: (operationId: number, cancelData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "USER_CANCELLED_PAYMENT",
                    "CANCELLED",
                    cancelData
                ),

            // 29. Usuario abandonó pago
            userAbandonedPayment: (operationId: number, abandonData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "USER_ABANDONED_PAYMENT",
                    "ABANDONED",
                    abandonData
                ),

            // === EVENTOS DE SISTEMA ===

            // 30. Timeout de pago
            paymentTimeout: (operationId: number, timeoutData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_TIMEOUT",
                    "TIMEOUT",
                    timeoutData
                ),

            // 31. Reintento de pago
            paymentRetry: (operationId: number, retryData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "PAYMENT_RETRY",
                    "RETRY",
                    retryData
                ),

            // 32. Error de red
            networkError: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "NETWORK_ERROR",
                    "ERROR",
                    errorData
                ),

            // 33. Error del servidor
            serverError: (operationId: number, errorData?: any) =>
                handlePaymentEvent(
                    operationId,
                    "SERVER_ERROR",
                    "ERROR",
                    errorData
                ),

            // Eventos adicionales para PaymentLog
            paymentProofUploaded: async (operationId: number, data: any) => {
                await handlePaymentEvent(
                    operationId,
                    "PAYMENT_PROOF_UPLOADED",
                    "PENDING",
                    data
                );
            },
            paymentProofRejected: async (operationId: number, data: any) => {
                await handlePaymentEvent(
                    operationId,
                    "PAYMENT_PROOF_REJECTED",
                    "REJECTED",
                    data
                );
            },
            paymentApproved: async (operationId: number, data: any) => {
                await handlePaymentEvent(
                    operationId,
                    "PAYMENT_APPROVED",
                    "PAID",
                    data
                );
            },
            paymentExpired: async (operationId: number, data: any) => {
                await handlePaymentEvent(
                    operationId,
                    "PAYMENT_EXPIRED",
                    "EXPIRED",
                    data
                );
            },
        },
        loading,
    };
};
