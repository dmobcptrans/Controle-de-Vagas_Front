import { MotoristaPayload } from "../../(personas)/motoristas/types/motorista"


export type StatusConviteMotorista =
    | 'PENDENTE'
    | 'ACEITO'
    | 'RECUSADO'

export type ConviteMotoristaPayload = {
    emailMotorista: string,
    nomeMotorista: string
}

export type RespondeConviteMotoristaPayload = {
    conviteToken: string,
    status: StatusConviteMotorista
    motorista: MotoristaPayload
}

export type ResponderConviteMotoristaExistentePayload = {
    conviteId: string,
    status: StatusConviteMotorista
}

