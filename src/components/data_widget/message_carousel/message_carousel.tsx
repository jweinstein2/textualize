import Bubble from "@/components/message/bubble";
import { Carousel } from "@mantine/carousel";
import { Center } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

interface CarouselProps {
    messages: [string];
}

function buildSlide(message: string, index: number) {
    return (
        <Carousel.Slide key={index}>
            <Center h="100%" mr="40px" ml="40px">
                <Bubble message={message} isSent={false}></Bubble>
            </Center>
        </Carousel.Slide>
    );
}

function MessageCarousel(props: CarouselProps) {
    if (props.messages.length === 1) {
        return (
            <Center h="100%">
                <Bubble message={props.messages[0]} isSent={false}></Bubble>
            </Center>
        );
    }

    return (
        <Carousel
            h="100%"
            w="100%"
            loop
            withIndicators
            height={224} /* TODO: Properly handle magic number */
            slideSize="100%"
            slideGap="md"
            nextControlIcon={<IconArrowRight size={16} />}
            previousControlIcon={<IconArrowLeft size={16} />}
        >
            {props.messages.map(buildSlide)}
        </Carousel>
    );
}

export default MessageCarousel;
