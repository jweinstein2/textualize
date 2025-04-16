import { MoveDirection } from "@tsparticles/engine";

export const STARS = {
    autoPlay: true,
    background: {
        opacity: 0,
    },
    particles: {
        number: {
            value: 1000,
            density: {
                enable: true,
                width: 1024,
                height: 1024,
            },
        },
        move: {
            direction: MoveDirection.top,
            enable: true,
            speed: 0.5,
            straight: true,
        },
        opacity: {
            animation: {
                enable: true,
                speed: 0.1,
                sync: false,
            },
            value: { min: 0, max: 0.3 },
        },
        size: {
            value: { min: 0.2, max: 1.5 },
        },
    },

}
