import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph } from '../components/gante-core';
import Sidebar from '../components/sidebar';
import styles from './editor.module.css';

export default function Editor() {
    return (
        <GanteProvider>
            <Container className={styles.editor}>
                <LeftSide>
                    <Sidebar />
                </LeftSide>
                <Content>
                    <GanteGraph />
                </Content>
            </Container>
        </GanteProvider>
    );
}
