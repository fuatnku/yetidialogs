import { Edge } from "reactflow";
import CustomNode from "./CustomNode";

export const initialEdges: Edge[] = [];

export const initialNodes: typeof CustomNode[] =  [
  {
    id: '1',
    type: 'customNode', // bu, nodeTypes'ta tanımladığınız özel node tipini kullanır
    position: { x: 250, y: 5 },
    data: {
      question: {
        en: "What is your favorite color?",
        tr: "En sevdiğin renk nedir?"
      },
      answers: [
        {
          text: {
            en: "Blue",
            tr: "Mavi"
          },
          connect: '2' // bağlanacak node id'si
        },
        {
          text: {
            en: "Red",
            tr: "Kırmızı"
          },
          connect: '3'
        }
      ]
    }
  },
  {
    id: '2',
    type: 'customNode',
    position: { x: 100, y: 200 },
    data: {
      question: {
        en: "Why do you like blue?",
        tr: "Neden maviyi seviyorsun?"
      },
      answers: [
        {
          text: {
            en: "It's calming",
            tr: "Sakinleştirici"
          },
          connect: '4'
        }
      ]
    }
  },
  {
    id: '3',
    type: 'customNode',
    position: { x: 400, y: 200 },
    data: {
      question: {
        en: "Why do you like red?",
        tr: "Neden kırmızıyı seviyorsun?"
      },
      answers: [
        {
          text: {
            en: "It's vibrant",
            tr: "Canlı"
          },
          connect: '4'
        }
      ]
    }
  },
  {
    id: '4',
    type: 'customNode',
    position: { x: 250, y: 400 },
    data: {
      question: {
        en: "Would you like to learn more about colors?",
        tr: "Renkler hakkında daha fazla bilgi edinmek ister misin?"
      },
      answers: [
        {
          text: {
            en: "Yes, please",
            tr: "Evet, lütfen"
          },
          connect: '1' // İlk node'a geri dönüş yapar, döngüsel bir akış oluşturabilir
        },
        {
          text: {
            en: "No, thanks",
            tr: "Hayır, teşekkürler"
          },
          connect: '1' // Aynı şekilde, ilk node'a dönüş yapar
        }
      ]
    }
  }
];