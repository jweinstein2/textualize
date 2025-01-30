import Bubble from "@/components/message/bubble";
import { Center } from "@mantine/core";

interface CarouselProps {
    messages: [string];
}

function MessageCarousel(props: CarouselProps) {
    return (
        <Center>
            <Bubble message={props.messages[0]} size="80px" isSent></Bubble>
        </Center>
    );
}

export default MessageCarousel;
