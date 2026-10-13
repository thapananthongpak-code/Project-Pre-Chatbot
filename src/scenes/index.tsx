import type { ComponentType } from 'react'
import Cover from './Cover'
import Problem from './Problem'
import Scope from './Scope'
import Dataset from './Dataset'
import Rag from './Rag'
import Chatbot from './Chatbot'
import Tools from './Tools'
import Related from './Related'
import Method from './Method'
import Build from './Build'
import Evaluation from './Evaluation'
import Results from './Results'
import Conclusion from './Conclusion'
import Appendix from './Appendix'

/** ลำดับต้องตรงกับ scenes[] ใน content.ts */
export const SCENE_COMPONENTS: ComponentType[] = [
  Cover,
  Problem,
  Scope,
  Dataset,
  Rag,
  Chatbot,
  Tools,
  Related,
  Method,
  Build,
  Evaluation,
  Results,
  Conclusion,
  Appendix,
]
