
/**
 * Represents a mapping that requires picking a specific number of unique parts from a set of options.
 */
export interface RandomMapping {
  options: string[];
  roll: number;
}

/**
 * Mapping of visible conditions to body part IDs for the anatomy map.
 */
export const CONDITION_TO_PARTS: Record<string, string[] | string[][] | RandomMapping> = {
  "Dermatite Atópica Visível": ['head', 'neck', 'right-arm', 'left-arm'],
  "Calvície Androgenética Inicial": ['head'],
  "Leve Calvície (Alopecia)": ['head'],
  "Olheiras Crônicas Marcadas": ['orbit'],
  "Cicatriz Pequena (Rosto/Braço)": [['head'], ['right-arm'], ['left-arm']],
  "Cicatrizes de Acne Severa no Rosto": ['head'],
  "Psoríase em Placas (Cotovelos/Joelhos)": ['right-arm', 'left-arm', 'right-leg', 'left-leg'],
  "Cabelo Grisalho Prematuro": ['head'],
  "Cicatriz Cirúrgica Extensa (Flanco/Abdômen)": ['abdomen'],
  "Nariz Quebrado/Torto": ['head'],
  "Tatuagem Militar Coberta/Queimada": [['right-arm'], ['left-arm'], ['chest']],
  "Obesidade Grau I": ['abdomen', 'chest', 'right-leg', 'left-leg'],
  "Vitiligo Generalizado": ['head', 'neck', 'chest', 'abdomen', 'right-arm', 'left-arm', 'right-hand', 'left-hand', 'right-leg', 'left-leg'],
  "Sobrepeso Visível": ['abdomen', 'chest'],
  "Estrabismo Divergente": ['orbit'],
  "Tremor Essencial (Mãos)": ['right-hand', 'left-hand'],
  "Claudicação Leve ao Andar": ['right-leg', 'left-leg'],
  "Cicatriz Cirúrgica Extensa (Abdômen/Peito)": ['abdomen', 'chest'],
  "Alopecia Areata (Falhas Circulares no Cabelo)": ['head'],
  "Alopecia Areata (Perda em Placas)": ['head'],
  "Fotodermatite Actínica Severa": {
    options: ['head', 'abdomen', 'chest', 'left-leg', 'right-leg'],
    roll: 3
  },
  "Hemiplesia Facial (Sequela de AVC)": ['head'],
  "Nanismo (Acondroplasia)": ['head', 'chest', 'abdomen', 'right-arm', 'left-arm', 'right-leg', 'left-leg'],
  "Sequelas de Trauma Tecidual por Laceração Extensa": {
    options: ['abdomen', 'left-arm', 'right-arm', 'chest', 'left-shoulder', 'right-shoulder', 'right-leg', 'left-leg', 'neck', 'head'],
    roll: 5
  },
  "Amputação Parcial de Membro Superior": {
    options: ['right-arm', 'right-hand', 'left-arm', 'left-hand'],
    roll: 1
  },
  "Queimaduras de 3º Grau Visíveis": ['head', 'neck', 'chest', 'abdomen', 'right-arm', 'left-arm'],
  "Neuropatia Periférica e Encefalopatia por Trauma Elétrico Atmosférico": {
    options: ['head', 'neck', 'left-shoulder', 'chest', 'right-arm', 'abdomen', 'left-arm', 'left-leg', 'right-leg'],
    roll: 7
  },
  "Amputação de Membro Inferior (Cadeira de Rodas)": [['right-leg', 'right-foot'], ['left-leg', 'left-foot']],
  "Paralisia Cerebral com Espasticidade": ['head', 'chest', 'abdomen', 'right-arm', 'left-arm', 'right-hand', 'left-hand', 'right-leg', 'left-leg', 'right-foot', 'left-foot'],
  "Anorexia Nervosa (Caquexia)": ['chest', 'abdomen', 'right-arm', 'left-arm', 'right-leg', 'left-leg'],
  "Amputação (Dedos ou Parte do Pé)": [['right-foot'], ['left-foot']],
  "Amputação (Dedos ou Parte da Mão)": {
    options: ['right-hand', 'left-hand'],
    roll: 1
  },
  "Paraplegia (Cadeirante)": ['right-leg', 'left-leg', 'right-foot', 'left-foot'],
  "Cegueira Total": ['orbit'],
  "Tetraplegia": ['neck', 'chest', 'abdomen', 'right-arm', 'left-arm', 'right-hand', 'left-hand', 'right-leg', 'left-leg', 'right-foot', 'left-foot'],
  "Necrose extensa de tecidos moles (Visível)": {
    options: ['right-leg', 'left-leg', 'right-arm', 'left-arm', 'left-hand', 'right-hand', 'right-foot', 'left-foot'],
    roll: 6
  }
};
