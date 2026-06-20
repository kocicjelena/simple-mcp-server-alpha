import ChatClaude from '@/components/ChatClaude';
import ChatStreamForm from '@/components/ChatStreamForm/Wrap';
import PublicWorkflow from '@/components/pushmodel/PublicWorkflow';
import ToolForm from '@/components/ToolForm';
import styles from "../page.module.css";


export default function Page() {
  return (
    <>
     <h3>Make your own tool</h3>
    <ToolForm />
     {/* <div className={styles.content}>
         <h3>Chat with tool attached</h3>
     </div>
    <hr />
  <h4>TODO context tool</h4> 
     <ChatClaude /> */}
    </>
  );
}
