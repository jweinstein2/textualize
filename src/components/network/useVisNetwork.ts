import { useLayoutEffect, useRef, useState } from "react";
import {
    Data,
    Edge,
    Network,
    Node,
    Options,
} from "vis-network/standalone/esm/vis-network";

export interface UseVisNetworkOptions {
    options: Options;
    nodes: Node[];
    edges: Edge[];
}

export default (props: UseVisNetworkOptions) => {
    const { edges, nodes, options } = props;

    const [network, addNetwork] = useState<Network | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const data: Data = { nodes, edges };
        if (ref.current) {
            const instance = new Network(ref.current, data, options);
            addNetwork(instance);
        }
        return () => network?.destroy();
    }, [nodes, edges, options]);

    return {
        network,
        ref,
    };
};
