import asyncio
import logging
from typing import Callable, Awaitable, Optional
import aio_pika
from aio_pika.abc import AbstractRobustConnection, AbstractRobustChannel, AbstractQueue

logger = logging.getLogger("zyra.messaging.rabbitmq")


class RabbitMQClient:
    """Async RabbitMQ client wrapper using aio-pika for resilient message consumption."""

    def __init__(
        self,
        host: str = "localhost",
        port: int = 5672,
        username: str = "guest",
        password: str = "guest",
        virtual_host: str = "/",
    ) -> None:
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.virtual_host = virtual_host
        self._connection: Optional[AbstractRobustConnection] = None
        self._channel: Optional[AbstractRobustChannel] = None

    @property
    def url(self) -> str:
        return f"amqp://{self.username}:{self.password}@{self.host}:{self.port}/{self.virtual_host.lstrip('/')}"

    async def connect(self) -> None:
        """Establish a robust connection to RabbitMQ with retry tolerance."""
        try:
            logger.info("Connecting to RabbitMQ at %s:%d (vhost: %s)", self.host, self.port, self.virtual_host)
            self._connection = await aio_pika.connect_robust(self.url)
            self._channel = await self._connection.channel()
            logger.info("Successfully connected to RabbitMQ.")
        except Exception as exc:
            logger.warning("Failed to connect to RabbitMQ broker (offline/unreachable): %s", exc)
            self._connection = None
            self._channel = None
            raise

    async def close(self) -> None:
        """Close channel and connection cleanly."""
        if self._channel and not self._channel.is_closed:
            await self._channel.close()
        if self._connection and not self._connection.is_closed:
            await self._connection.close()
        logger.info("RabbitMQ connection closed.")

    @property
    def is_connected(self) -> bool:
        return self._connection is not None and not self._connection.is_closed

    async def consume_queue(
        self,
        queue_name: str,
        on_message_callback: Callable[[bytes], Awaitable[None]],
    ) -> Optional[AbstractQueue]:
        """Declare/bind queue and register message processing callback."""
        if not self.is_connected or self._channel is None:
            raise RuntimeError("Cannot consume: RabbitMQ client is not connected.")

        queue = await self._channel.declare_queue(queue_name, durable=True)

        async def _message_handler(message: aio_pika.abc.AbstractIncomingMessage) -> None:
            async with message.process():
                await on_message_callback(message.body)

        await queue.consume(_message_handler)
        logger.info("Listening for messages on queue: '%s'", queue_name)
        return queue
