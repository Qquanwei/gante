import { Container, LeftSide, Content } from '../components/layout';
import { GanteProvider, GanteGraph, StatusBar } from '../components/gante-core';
import Sidebar from '../components/sidebar';
import styles from './editor.module.css';

// 左边是一个TODO，右边是一个Gante

export default function Editor() {
    return (
        <GanteProvider>
            <Container className={styles.editor}>
                <Content>
                    <GanteGraph />
                </Content>
                <StatusBar className={styles.statusbar}/>
            </Container>
        </GanteProvider>
    );
}
